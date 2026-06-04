# CreditWise — Sistem de gestionare a creditelor bancare

> Aplicație web pentru acordare de credite bancare și asistare a deciziilor în analizarea clientilor.

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)](https://supabase.com/)
[![Anthropic Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-D97757)](https://www.anthropic.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-blue)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## Despre proiect

CreditWise este o aplicație web full-stack dezvoltată ca lucrare de licență. Permite unei instituții bancare să:

- înregistreze și să gestioneze profilurile clienților (inclusiv CNP, venituri, status angajare)
- primească și să prelucreze cereri de credit
- calculeze automat un **scor de risc** pe baza unui sistem ponderat (raport datorii/venituri, stabilitate angajare, vârstă, raport sumă/venit anual)
- urmărească deciziile analiștilor și să genereze tranzacții de disbursare
- expună statistici agregate (rate de aprobare, distribuție risc, performanță analiști, trend lunar)
- ofere un **asistent AI conversațional** (Anthropic Claude cu tool use) pentru interogarea datelor în limbaj natural, cu authorization moștenită din rolul utilizatorului

## Funcționalități cheie

### Autentificare și securitate
- JWT cu **SecurityStamp** pentru invalidare imediată la schimbare parolă / rol / dezactivare cont
- Hash parole cu **BCrypt** (cost factor 11)
- Autorizare rolică: `Admin`, `Analyst`, `Banker`
- Rate limiting per IP pe endpoint-urile sensibile (login, forgot-password), per user pe chat AI
- Password complexity (min 8 caractere, literă + cifră)
- ProblemDetails pentru răspunsuri de eroare consistente
- Reset parolă prin email cu token cu expirare 1h

### Gestionare clienți & cereri
- CRUD complet clienți cu validare CNP unic
- Cereri credit cu scoring automat la creare
- Paginare server-side (până la 1000 items per pagină)
- Search server-side cu `ILIKE` PostgreSQL pe câmpuri multiple
- Soft delete pentru utilizatori (`IsActive`)

### Workflow decizional
- Analiștii primesc cereri în **Panel Analist**
- Aprobare / Respingere / Cerere informații suplimentare
- Notificare email automată clientului la finalizarea deciziei
- Notificare email broadcast către analiști + admini la cerere nouă (filtrată prin preferințe utilizator)

### Asistent AI (Anthropic Claude Sonnet 4.6)
- 7 tools read-only: `get_client`, `list_clients`, `get_credit_request`, `list_credit_requests`, `get_dashboard_stats`, `get_decision`, `list_transactions`
- Filtrare tools per rol (banker NU vede `get_decision` și `list_transactions`)
- Tool use loop cu maxim 5 iterații, sequential execution
- Prompt caching pe system prompt + tools (~70-90% reducere cost pe turnuri ulterioare)
- Conversație păstrată în browser (fără persistență DB)
- Vezi [`CHATBOT.md`](./CHATBOT.md) pentru specificația completă

### Analytics & Reports
- Dashboard cu KPI-uri, distribuție status, distribuție risc, trend lunar
- Rapoarte server-side cu performanța analiștilor și agregate suplimentare
- Export PDF prin browser print

### Email
- MailKit + SMTP (MailHog pentru dev, Resend-compatible pentru producție)
- Template-uri HTML cu fallback plain-text
- Fire-and-forget pattern (nu blochează HTTP response)

### Setări utilizator
- Persistență preferințe (notificări, limbă, format dată, items per pagină, temă)
- `itemsPerPage` aplicat live pe listele de clienți și cereri credit

## Arhitectură

Aplicația respectă **Clean Architecture** cu 4 layers și inversiune de dependențe:

```
┌──────────────────────────────────────────────────────────┐
│ CreditApp.API           Controllers, middleware, DI      │ ← entry point
├──────────────────────────────────────────────────────────┤
│ CreditApp.Application   Services, DTOs, interfaces       │ ← business rules
├──────────────────────────────────────────────────────────┤
│ CreditApp.Domain        Entities, enums, repo contracts  │ ← pure logic
├──────────────────────────────────────────────────────────┤
│ CreditApp.Infrastructure  EF Core, repositories, SMTP    │ ← I/O concrete
└──────────────────────────────────────────────────────────┘

Direcția dependențelor: API → Application → Domain
                        Infrastructure → Application + Domain
```

Vezi [`docs/diagrams/exports/architecture.png`](./docs/diagrams/exports/architecture.png) pentru diagramă vizuală.

### Stack tehnologic

| Layer | Tehnologii |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, react-router-dom, react-markdown, axios |
| **Backend** | .NET 9, ASP.NET Core Web API, Entity Framework Core, MailKit, MailHog/Resend (SMTP), Anthropic SDK (HTTP direct) |
| **Database** | PostgreSQL 16 (cloud-hosted pe Supabase, local pentru dev) |
| **AI** | Anthropic Claude Sonnet 4.6 cu tool use API |
| **Securitate** | JWT (Microsoft.IdentityModel), BCrypt.Net, Microsoft.AspNetCore.RateLimiting |
| **Tooling** | EF Core migrations, dotnet user-secrets, Docker (dev), Git |

## Modelul de date

5 entități principale:

| Entitate | Rol |
|---|---|
| `User` | Utilizatori interni (Admin/Analyst/Banker) cu SecurityStamp pentru invalidare JWT |
| `Client` | Solicitanți de credit, identificați prin CNP |
| `CreditRequest` | Cereri de credit, conține scor de credit, nivel risc, status |
| `Decision` | Decizia analistului asupra unei cereri (1:1 cu CreditRequest) |
| `UserPreference` | Preferințe per-utilizator (notificări, items per pagină, etc.) |

Vezi [`docs/diagrams/exports/er-diagram.png`](./docs/diagrams/exports/er-diagram.png) pentru diagrama completă.

## Setup

### Cerințe

- **.NET 9 SDK** ([download](https://dotnet.microsoft.com/download))
- **Node.js 18+** și npm
- **PostgreSQL 13+** (local) **sau** cont [Supabase](https://supabase.com) (cloud, gratuit)
- **Docker** (opțional, pentru MailHog dev SMTP)
- **API key Anthropic** pentru funcționalitatea AI ([console.anthropic.com](https://console.anthropic.com))

### 1. Clonare repo

```bash
git clone https://github.com/<username>/credit-loan-system.git
cd credit-loan-system
```

### 2. Configurare user-secrets backend

Toate credențialele sensibile sunt stocate în .NET User Secrets (în afara repo-ului):

```bash
cd CreditApp.API

dotnet user-secrets set "JwtSettings:SecretKey" "$(openssl rand -base64 48)"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=creditapp;Username=postgres;Password=postgres;SslMode=Disable"
dotnet user-secrets set "Seed:AdminPassword" "AdminSecure123!"
dotnet user-secrets set "Anthropic:ApiKey" "sk-ant-..."
```

Pentru Supabase, înlocuiește connection string-ul cu [Session pooler URL](https://supabase.com/docs/guides/database/connecting-to-postgres) (format Npgsql):

```
Host=aws-0-eu-central-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.<REF>;Password=<PASS>;SslMode=Require;TrustServerCertificate=true
```

### 3. Setup MailHog (dev SMTP)

```bash
docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

UI MailHog la `http://localhost:8025`.

### 4. Rulare backend

```bash
cd CreditApp.API
dotnet run
```

Backend ascultă pe `http://localhost:5286`. La prima pornire:
- Validează user-secrets
- Aplică migrațiile EF
- Seed-uiește un utilizator admin

### 5. Rulare frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend pe `http://localhost:5173`. Login cu credențialele admin seed-uite.

## Structura proiectului

```
credit-loan-system/
├── CreditApp.API/                  # ASP.NET Core entry point + Controllers
├── CreditApp.Application/          # Servicii, DTOs, interfețe (Clean Arch.)
├── CreditApp.Domain/               # Entități, enums, interfețe repo
├── CreditApp.Infrastructure/       # EF Core, repositories, SMTP, Anthropic
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── api/                   # axios wrappers per resursă
│   │   ├── components/            # UI shared + chat panel + layout
│   │   ├── context/               # AuthContext (user + preferences)
│   │   ├── hooks/                 # useDebounce, etc.
│   │   └── pages/                 # 14 pagini, una per route principal
│   └── package.json
├── docs/
│   ├── diagrams/                  # ER, architecture, use case, sequence
│   └── screenshots/               # Screenshots pentru thesis
├── postman/                       # Collection JSON
├── CHATBOT.md                     # Specificație feature chatbot
└── README.md
```

## Securitate — măsuri implementate

| Măsură | Detalii |
|---|---|
| Hashing parole | BCrypt cu cost factor 11 |
| JWT cu invalidare | SecurityStamp claim verificat la fiecare request |
| Authorization | Role-based (`[Authorize(Roles=...)]`) + tool-level filtering pe AI |
| Rate limiting | 5 req/min/IP pe auth; 20 req/5min/user pe chat |
| Validare input | Data Annotations (DTOs) + validare server-side în servicii |
| Password policy | Min 8 caractere, ≥1 literă, ≥1 cifră |
| HTTPS redirect | Activ în prod |
| CORS strict | Doar origin frontend permis |
| Secret management | User Secrets în dev, env vars în prod (zero credențiale în git) |
| Error sanitization | ProblemDetails — nu leak details la 500 |
| FK constraints | `SetNull` pentru AssignedAnalyst (păstrăm cererea), `Restrict` pentru Decision.Analyst (audit trail intact) |

## Testare

În prezent: smoke testing manual prin UI + probe `curl` pentru endpoint-uri cheie. Plan: integrare xUnit + WebApplicationFactory pentru teste de integrare HTTP.

## Documente conexe

- [`CHATBOT.md`](./CHATBOT.md) — Specificație detaliată pentru feature-ul de AI chatbot
- [`docs/diagrams/`](./docs/diagrams/) — Diagrame UML și ER
- [`postman/`](./postman/) — Postman collection pentru API

## Lucrarea de licență

Această aplicație constituie partea practică a lucrării de licență cu titlul *Aplicație web pentru gestionarea cererilor de credit bancar cu integrare AI*, susținută în iunie 2026, sub coordonarea **[Nume coordonator]**, [Universitatea].

## License

Acest proiect este destinat exclusiv evaluării academice și demonstrației portofoliului personal.
