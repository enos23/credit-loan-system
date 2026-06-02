# AI Chatbot — Scope & Design

**Status:** scope locked, pre-implementation
**Nivel implementare:** 2 — Tool Use peste DB-ul aplicației (~12-18h estimat)
**Versiune:** 1.0

---

## 1. Cui se adresează

Utilizatori interni autenticați (Admin, Analyst, Banker). Nu e customer-facing.

Rulează în sesiunea user-ului curent. Răspunsurile și ce poate face sunt scoped strict la permisiunile lui prin REST API existent.

## 2. Ce face

Asistă utilizatorul să interogheze datele aplicației în limbaj natural. Cazuri tipice:

- "Câte cereri pending sunt acum?"
- "Care e clientul X și ce cereri are?"
- "Care e scor mediu de credit pentru cererile aprobate luna asta?"
- "Cine e analistul care a procesat cele mai multe cereri săptămâna trecută?"
- "Ce decizie s-a luat pe cererea Y? Care a fost justificarea?"
- "Care e suma totală disbursată pe credite cu risc Low?"

Răspunde în Markdown, cu cifre concrete trase din DB prin tool calls. Nu inventează date.

## 3. Ce NU face

- **Nu modifică date.** Toate tool-urile sunt read-only.
- **Nu emite sfaturi de creditare.** Oferă date, nu opinii ("ar trebui să aprobi").
- **Nu răspunde la întrebări fără context din DB.** Întrebări generale despre piață → refuz politicos.
- **Nu accesează date la care user-ul curent nu are acces.** Tool-urile moștenesc authz din REST.
- **Nu păstrează context cross-session.** Refresh-ul de browser șterge istoricul.

## 4. Tools (toate read-only)

| Tool | Parametri | Returnează | Admin | Analyst | Banker |
|---|---|---|---|---|---|
| `get_client` | `clientId: Guid` SAU `cnp: string` | profilul clientului | ✓ | ✓ | ✓ |
| `list_clients` | `page, pageSize, search` | listă paginată | ✓ | ✓ | ✓ |
| `get_credit_request` | `requestId: Guid` | cererea + decizia atașată (dacă există) | ✓ | ✓ | ✓ |
| `list_credit_requests` | `page, pageSize, status?, riskLevel?, search?` | listă paginată cu filtre | ✓ | ✓ | ✓ |
| `get_dashboard_stats` | — | snapshot agregat | ✓ | ✓ | ✓ |
| `get_decision` | `requestId: Guid` | decizia + notițele analistului | ✓ | ✓ | **✗** |
| `list_transactions` | `page, pageSize` | credite disbursate | ✓ | ✓ | **✗** |

**Max 5 tool calls per turn.** Al 6-lea → eroare clară, previne loop-uri.

## 5. Authorization

Tool-urile sunt wrappers subțiri peste service-urile existente (`IClientService`, etc.) apelate cu identitatea user-ului curent. Authz se moștenește automat din REST. Lista de tools disponibile model-ului e filtrată per rol înainte de request (banker primește lista scurtă din §4).

## 6. Tech stack

- **Provider:** Anthropic Claude API
- **Model:** `claude-sonnet-4-6` (răspunsuri nuanțate, performant pentru tool use complex)
- **SDK în .NET:** HTTP direct via `HttpClient`. ~150 linii cod pentru request/response + tool loop. Fără dependență suplimentară volatilă.
- **Prompt caching:** ON pe system prompt + tool definitions. Reduce cost cu 70-90% pe request-uri din aceeași sesiune.
- **Streaming:** OFF pentru v1. Adăugat ulterior dacă merită.

## 7. UI

- **Trigger:** floating button bottom-right ("Întreabă AI")
- **Panel:** slide-in din dreapta, ~400px desktop / fullscreen mobil
- **Componente:** header (titlu + close), message list (scroll), input + send
- **Mesaje:**
  - User → dreapta, fundal indigo
  - Assistant → stânga, fundal alb, Markdown render
  - Tool calls → colapsate în detail expandabil ("🔧 Am verificat 3 cereri")
- **Loading state:** dot bouncing animation

## 8. Cost & rate limiting

- **Per-user rate limit:** 20 mesaje / 5 minute, policy `"chat"` în `Microsoft.AspNetCore.RateLimiting`
- **Max tokens per response:** 1024 (cap server-side prin parametru API)
- **Max tool calls per turn:** 5
- **Estimare cost cu Sonnet 4.6:** ~$3/M input + $15/M output. Un mesaj tipic = 500-2000 tokens. Per user activ care trimite 20 mesaje/zi → ~$0.50-1.50/lună. Acceptabil pentru demo.

## 9. Conversation persistence

**În memorie browser only** (React state). Refresh șterge istoricul. Fără tabelă DB nouă.

Iterație viitoare (out of scope acum): `ChatSession` + `ChatMessage` cu retention 30 zile.

## 10. Observability

Log server-side per request către Anthropic:
- `UserId`, `Timestamp`, `InputTokens`, `OutputTokens`, `ToolCallsCount`, `DurationMs`, `Error?`

**Nu logăm conținutul mesajelor.** Doar metrici.

## 11. Failure modes & guardrails

| Risc | Mitigare |
|---|---|
| Model halucinează cifre fără tool call | System prompt: "Niciodată cifre concrete fără tool call în acest turn." |
| User cere acțiune destructivă | System prompt: "Ești read-only. Explică limitarea + sugerează cum se face din UI." |
| Tool call eroare 500 | Returnează error string către model; model recunoaște și explică user-ului |
| Prompt injection | System prompt are prioritate; tool calls trec prin REST authz oricum |
| Rate limit Anthropic atins | Cache 429 → "Sistem ocupat momentan. Reîncearcă în 60s." |
| Costuri scapă de sub control | Per-user rate limit (§8) + max tokens cap |

## 12. Out of scope pentru v1

- Streaming responses
- Persistență istoric în DB
- Multi-language explicit (răspunde în limba mesajului natural)
- Voice I/O
- Generare PDF/Excel
- Tools pentru servicii externe (Bloomberg, BNR, etc.)

## 13. Definition of done pentru v1

- [ ] Endpoint `POST /api/Chat` care primește mesaj + istoric, returnează răspuns + tool calls efectuate
- [ ] Cele 7 tools implementate, toate cu authz inherited
- [ ] Rate limiting `"chat"` policy funcțional
- [ ] System prompt cu guardrails din §11
- [ ] UI panel funcțional pe desktop (mobile vine cu #4.5 responsive)
- [ ] Logging metric per request (fără conținut mesaje)
- [ ] Banker primește lista filtrată de tools (test E2E: banker nu poate cere `get_decision` reușit)
- [ ] Smoke test: cele 6 cazuri din §2 răspund corect

---

## Decizii lăsate pentru implementare

- Exact system prompt text — iterăm în development
- Wireframe vizual UI — mockup ASCII la momentul implementării
- Structura claselor C# concrete — decizii de cod, nu de scope
