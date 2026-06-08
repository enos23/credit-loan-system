# CAPITOLUL III — IMPLEMENTAREA APLICAȚIEI (Batch B)

Această parte a Capitolului III continuă prezentarea detaliilor de implementare, concentrându-se asupra componentelor specializate care diferențiază aplicația CreditWise de o aplicație CRUD generică: asistentul AI bazat pe Tool Use, sistemul de notificări prin email, măsurile concrete de securitate, infrastructura de containerizare și deployment, precum și abordarea testării.

## III.5 Asistentul conversațional AI

Asistentul AI este una dintre componentele cu cea mai mare valoare adăugată a aplicației și, totodată, cea care a necesitat cea mai mare cantitate de proiectare arhitecturală. Spre deosebire de un chatbot clasic, care răspunde pe baza unui model lingvistic generic, asistentul implementat în CreditWise utilizează paradigma **Tool Use** oferită de Anthropic Claude, ceea ce înseamnă că model-ul nu generează răspunsuri "din capul lui", ci apelează funcții reale ale aplicației pentru a obține date concrete pe care apoi le formulează coerent pentru utilizator.

### III.5.1 Modelul Anthropic Claude Sonnet 4.6

Aplicația utilizează modelul **claude-sonnet-4-6** (identificator API), accesat prin endpoint-ul `https://api.anthropic.com/v1/messages`. Acesta este un model conversațional generalist cu capabilitate de raționament avansat, optimizat pentru utilizarea uneltelor (function calling). Pentru fiecare conversație, request-ul către API include următoarele componente:

- **system prompt** (statică, identică între request-uri) — descrie rolul și constrângerile asistentului
- **tools** (statice) — schema JSON Schema a celor 7 unelte disponibile
- **messages** (dinamică) — istoricul conversației, incluzând mesajele utilizatorului și rezultatele apelurilor de tools

Întrucât prompt-ul de sistem și definițiile uneltelor sunt identice între request-uri, dar reprezintă o cantitate semnificativă de tokeni (~2000-3000 tokens), a fost activat mecanismul de **prompt caching** prin marker-ul `cache_control: { type: "ephemeral" }`. Acest mecanism reduce costul de procesare cu 70-90% pentru tokenii cached, fiind reutilizați pe parcursul a 5 minute. La nivel financiar, această optimizare reduce costul tipic al unei conversații medii de la ~$0.04 la ~$0.008.

### III.5.2 System prompt

Prompt-ul de sistem definește identitatea, capabilitățile și constrângerile asistentului. Este formulat în limbaj natural și include reguli explicite pentru comportamentul așteptat:

```
You are CreditWise Assistant, an AI helper embedded inside an internal
banking application that manages credit requests and analyst decisions.

You help users (admins, analysts, bankers) by answering questions about
the data they have access to in this application — clients, credit
requests, decisions, transactions and KPIs. You can call read-only tools
to fetch concrete data from the database.

Hard rules:
- NEVER invent data. If a tool returns no results, say so plainly.
- NEVER guess CNPs, amounts, IDs or other identifiers.
- ALWAYS respect the user's permissions. Tools called on your behalf are
  filtered server-side by the user's role and identity.
- Respond in the same language the user writes in (Romanian or English).
- Format responses with Markdown (tables, bullets, bold).
```

Această abordare combinată — instrucțiuni explicite plus filtrare server-side — asigură că asistentul nu poate fi exploatat pentru a accesa date la care utilizatorul nu are dreptul, chiar și dacă acesta i-ar cere insistent acest lucru prin tehnici de prompt injection.

### III.5.3 Cele șapte tools read-only

Au fost expuse modelului șapte unelte, toate strict read-only, fiecare având o schema JSON Schema completă cu descriere, parametri și tipuri de returnare. Lista lor:

1. **`search_clients`** — caută clienții după nume, email sau CNP, cu paginare
2. **`get_client_by_id`** — obține datele complete ale unui client după Id
3. **`search_credit_requests`** — caută cereri filtrabile după status, client sau analist
4. **`get_credit_request_by_id`** — obține detaliile complete ale unei cereri (cu decizia, dacă există)
5. **`list_recent_decisions`** — listează ultimele N decizii din sistem
6. **`get_dashboard_kpis`** — obține KPI-urile principale ale aplicației
7. **`get_reports_summary`** — obține un sumar complet al rapoartelor (status, scop, risc, analiști)

Fiecare unealtă este implementată ca o clasă C# separată în namespace-ul `CreditApp.Application.Chat.Tools`, cu o metodă `ExecuteAsync(JsonElement input, UserContext userContext)` care primește argumentele de la model, deleg către serviciul potrivit și returnează JSON-ul rezultat. Întreaga listă de tools este înregistrată într-un dicționar accesibil prin nume, ceea ce permite adăugarea ulterioară a unor unelte noi cu modificări minime în codul existent.

### III.5.4 Bucla de execuție

Logica centrală a serviciului `ChatService` implementează o buclă în care:

1. Trimite mesajele istoricului către API-ul Anthropic
2. Primește răspunsul model-ului
3. Dacă răspunsul conține blocuri de tip `tool_use`, execută tool-urile cerute, adaugă rezultatele ca mesaje noi în istoric și revine la pasul 1
4. Dacă răspunsul este un text final (`stop_reason: "end_turn"`), îl returnează către utilizator

Această buclă permite model-ului să facă apeluri multiple într-un singur turn de conversație. De exemplu, pentru întrebarea "Câte cereri pending sunt pentru analistul Maria Ionescu?", model-ul ar putea apela întâi `search_credit_requests` pentru a obține lista de analiști, apoi `search_credit_requests` din nou cu filtrul aplicat, înainte de a formula răspunsul final. Numărul maxim de iterații este limitat la **5** pentru a evita bucle infinite cauzate de eventuale defecte în logica model-ului.

### III.5.5 Trace-ul tool call-urilor în interfață

Pentru transparență și debugging, panoul de chat afișează în interfață toate apelurile de tool efectuate de model. Fiecare apel apare ca un disclosure colapsabil sub răspunsul AI, cu numele tool-ului, parametrii primiți și fragmentul de rezultat returnat. Această vizualizare nu doar facilitează debugging-ul în dezvoltare, ci oferă și utilizatorilor finali o transparență explicită asupra surselor de date utilizate de asistent, ceea ce întărește încrederea în răspunsurile sale.

### III.5.6 Rate limiting și protecție

Endpoint-ul `/api/chat` este protejat prin policy-ul `chat` configurat în Program.cs: maximum 20 mesaje per utilizator în 5 minute, identificat prin claim-ul JWT (nu prin IP, pentru a evita ca utilizatori multipli din aceeași rețea NAT să își împartă bugetul). Această limită este suficient de generoasă pentru utilizarea normală, dar previne abuzul în caz de scripting automatizat sau erori de aplicație care ar genera apeluri repetate.

## III.6 Sistemul de notificări prin email

Comunicarea automată cu clienții și analiștii este un element esențial al unei aplicații bancare moderne. CreditWise implementează un sistem de notificări email cu două scenarii principale: notificarea analiștilor activi la apariția unei cereri noi de credit și notificarea clientului la finalizarea unei decizii (aprobată, respinsă sau cerere de informații suplimentare).

### III.6.1 Arhitectura dual provider

Una dintre deciziile de design importante a fost separarea trimiterii efective a email-urilor de la logica de business prin interfața `IEmailService`, pentru a permite implementări multiple. Au fost dezvoltate două implementări:

- **`SmtpEmailService`** — folosește biblioteca **MailKit** și se conectează la un server SMTP standard. În dezvoltare locală, se conectează la **MailHog** (instalat prin Docker, expus pe portul 1025), care captează toate email-urile fără să le trimită efectiv. Aceasta este abordarea ideală pentru testare pentru că permite vizualizarea conținutului email-urilor printr-un UI web (pe portul 8025).

- **`ResendEmailService`** — folosește **Resend**, un serviciu modern de tranzacții email accesibil prin **HTTPS REST API** (la `https://api.resend.com/emails`). Această implementare a fost necesară pentru producție din cauza unei limitări specifice a platformei Render: tier-ul gratuit blochează porturile SMTP (25, 465, 587), ceea ce face imposibilă utilizarea directă a unui server SMTP. Resend ocolește această problemă folosind HTTPS standard, care nu este blocat.

Alegerea implementării active se face în `DependencyInjection.cs` din Infrastructure Layer, în funcție de variabila de configurare `Email:UseResendApi`:

```csharp
if (emailSettings.UseResendApi)
    services.AddHttpClient<IEmailService, ResendEmailService>();
else
    services.AddScoped<IEmailService, SmtpEmailService>();
```

Această configurare flexibilă permite ca aplicația să ruleze identic în orice mediu — dezvoltare locală cu MailHog, staging cu un cont de testare Resend, producție cu un cont real — modificând doar variabila de mediu, fără modificări de cod.

### III.6.2 Template-uri HTML responsive

Pentru a oferi o experiență vizuală profesională, au fost create trei template-uri HTML responsive, definite ca string-uri în clasa `EmailTemplates.cs` din Application Layer:

- **`NewCreditRequestForAnalysts`** — notifică analiștii despre o cerere nouă, cu detalii (nume client, sumă, termen, scor) și un buton-link care duce la pagina de panou a analistului
- **`DecisionApprovedForClient`** — notifică clientul despre aprobarea creditului, cu suma aprobată, rata dobânzii și termenul
- **`DecisionRejectedForClient`** — notifică clientul despre respingerea cererii, cu motivul (note-le analistului)

Toate template-urile urmează un layout consistent: header cu logo CreditWise, conținut centrat pe un fundal alb, footer cu informații de contact. Email-urile sunt acompaniate de o versiune **plain-text** (fallback) generată automat din HTML, pentru clienții de email care nu suportă HTML sau care preferă text simplu.

### III.6.3 Preferințe utilizator

Utilizatorii interni pot controla individual ce notificări primesc, prin pagina Setări (`/settings`). Cele patru opțiuni sunt:

- Email pentru cerere nouă (relevant pentru analiști)
- Email pentru decizie luată (informativ)
- Alerte browser (notificare în-app, fără email)
- Raport săptămânal (deocamdată placeholder; va fi implementat ulterior)

Aceste preferințe sunt persistate în tabela `UserPreferences` (descrisă în secțiunea III.1.5) și sunt verificate înainte de fiecare trimitere de email. Astfel, dacă un analist are dezactivată opțiunea "Email pentru cerere nouă", el nu va primi notificarea respectivă, chiar dacă este eligibil prin rol.

### III.6.4 Tratarea erorilor

Trimiterea unui email nu trebuie să blocheze fluxul de business al aplicației. Dacă serviciul de email este indisponibil (de exemplu, MailHog nu rulează în dezvoltare, sau Resend întoarce o eroare 5xx în producție), aplicația **nu** trebuie să eșueze tranzacția care a declanșat email-ul. Pentru a evita acest comportament, toate apelurile de trimitere sunt încadrate în blocuri `try/catch` la nivelul serviciilor de business, iar eventualele excepții sunt logate cu severitate `Warning` (nu `Error`), permițând tranzacției principale să continue.

## III.7 Securitatea aplicației

Securitatea unei aplicații bancare este o preocupare critică. CreditWise implementează o stivă completă de măsuri de securitate, începând de la stocarea credențialelor și până la limitele de rată impuse asupra endpoint-urilor sensibile.

### III.7.1 Hashing-ul parolelor cu BCrypt

Toate parolele utilizatorilor sunt stocate ca **hash-uri BCrypt** cu cost factor 11 (configurabil), ceea ce înseamnă că procesul de generare a hash-ului consumă aproximativ 100-200ms pe hardware modern. Această latență intenționată face ca atacurile de tip brute-force să fie impracticabile chiar și asupra unei copii a bazei de date. BCrypt include automat un **salt** aleatoriu de 16 bytes în fiecare hash, ceea ce face ca două parole identice să producă hash-uri diferite — eliminând astfel posibilitatea atacurilor cu rainbow tables.

Validarea parolei la login se face prin metoda `BCrypt.Verify(plainPassword, storedHash)`, care reproduce procesul de hashing folosind salt-ul extras din hash-ul stocat și compară rezultatele.

### III.7.2 Validarea complexității parolei

La crearea sau schimbarea unei parole, sistemul aplică o validare strictă a complexității prin clasa `PasswordValidator`:

- minimum 8 caractere
- cel puțin o literă mare
- cel puțin o cifră
- cel puțin un caracter special (`@$!%*?&`)

Aceste reguli sunt aplicate atât client-side (cu feedback vizual instant pentru utilizator) cât și server-side (pentru robustețe împotriva clienților rău-intenționați care ar putea ocoli validarea client-side).

### III.7.3 JSON Web Tokens cu SecurityStamp

Autentificarea utilizatorilor se face prin JWT cu durată de viață configurabilă (implicit 8 ore). Pe lângă claim-urile standard (`sub`, `email`, `role`), token-urile includ un claim custom `security_stamp` care conține un GUID stocat și în tabela `Users`. La fiecare request autenticat, middleware-ul JWT (configurat în `Program.cs` prin evenimentul `OnTokenValidated`) verifică:

1. Token-ul este valid criptografic
2. Utilizatorul există în baza de date
3. Utilizatorul are `IsActive = true`
4. `SecurityStamp`-ul din token este identic cu cel din baza de date

Dacă oricare dintre aceste verificări eșuează, request-ul este respins cu `401 Unauthorized`. Pentru a invalida toate token-urile active ale unui utilizator (de exemplu, după schimbarea parolei, modificarea rolului sau dezactivarea contului), este suficient să se regenereze `SecurityStamp`-ul în baza de date — toate token-urile emise anterior vor fi automat refuzate la următoarea utilizare.

Acest mecanism rezolvă una dintre principalele limitări ale JWT-urilor "standard" (faptul că sunt stateless și nu pot fi revocate înainte de expirare), păstrând în același timp performanța validării (un singur query după Id la fiecare request).

### III.7.4 Autorizarea bazată pe roluri

Toate endpoint-urile API care necesită autentificare sunt marcate cu atributul `[Authorize]`. Endpoint-urile care necesită un anumit rol sunt suplimentar marcate cu `[Authorize(Roles = "...")]`, de exemplu:

```csharp
[HttpPost]
[Authorize(Roles = "Admin,Analyst")]
public async Task<IActionResult> Create([FromBody] CreateDecisionDto dto)
{ /* ... */ }

[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> Delete(Guid id)
{ /* ... */ }
```

Filtrarea pe rol este aplicată de framework înainte ca request-ul să ajungă în acțiunea controllerului, garantând că niciun cod de business nu se execută pentru utilizatori neautorizați.

### III.7.5 Rate limiting

Două policy-uri distincte de rate limiting sunt configurate prin middleware-ul `Microsoft.AspNetCore.RateLimiting`:

- **`auth`** — aplică limită de **5 cereri per minut per IP** pentru endpoint-urile sensibile ca login, forgot password și reset password. Această limită este suficient de generoasă pentru utilizarea normală (un utilizator nu va încerca 5 parole în 60 de secunde), dar suficient de strictă pentru a face brute-force-ul impracticabil.

- **`chat`** — aplică limită de **20 mesaje per 5 minute per utilizator** (identificat prin claim JWT) pentru endpoint-ul de chat AI. Această limită evită atât abuzul intenționat, cât și costul accidental ridicat în caz de scripting eronat.

Răspunsul la depășirea limitei este `429 Too Many Requests`, însoțit de un mesaj clar în română: "Prea multe încercări. Vă rugăm să încercați din nou peste un minut."

### III.7.6 CORS configurabil prin variabile de mediu

Configurarea CORS este realizată pentru a accepta exclusiv originile permise, listate prin variabile de mediu de tip array:

```
Cors__AllowedOrigins__0=http://localhost:5173
Cors__AllowedOrigins__1=https://credit-loan-system.vercel.app
```

Această configurare permite deployment-ului în producție să accepte exclusiv frontend-ul real (Vercel), refuzând orice tentativă de origin spoofing din browser. În dezvoltare locală, valoarea implicită (`http://localhost:5173`) permite Vite-ul să comunice cu API-ul fără configurări suplimentare.

### III.7.7 Gestionarea secretelor

**Niciun secret** (chei API, parole de bază de date, JWT secrets, parola admin de seed) nu este stocat în repository. Mecanismele utilizate:

- **Dezvoltare locală**: `dotnet user-secrets`, care stochează valorile în `~/.microsoft/usersecrets/<id>/secrets.json` (în afara directorului proiectului)
- **Producție Render**: variabilele de mediu setate prin dashboard, criptate la rest
- **Producție Vercel**: la fel, variabilele de mediu (cu prefix `VITE_` pentru a fi expuse build-time)

Fișierul `.env.example` (inclus în repository) listează toate variabilele necesare, dar cu valori placeholder, oferind o documentație live a configurației fără a expune secretele reale.

### III.7.8 Gestionarea globală a erorilor

Middleware-ul `GlobalExceptionHandler` interceptează orice excepție necapturată în pipeline-ul de request și o transformă în răspuns HTTP standardizat conform **RFC 7807 ProblemDetails**. Tipurile de excepții recunoscute sunt:

- `NotFoundException` → 404 Not Found
- `ConflictException` → 409 Conflict
- `InvalidOperationException` → 400 Bad Request
- Excepții generice (orice altceva) → 500 Internal Server Error, cu mesaj generic ("A apărut o eroare neașteptată")

Pentru excepțiile 500, mesajul real al excepției și stack trace-ul **nu** sunt expuse clientului — sunt logate doar server-side. Această decizie previne scurgerea informațiilor sensibile (structura bazei de date, căile fișierelor server, versiunile de bibliotecilor) către atacatori potențiali.

## III.8 Containerizarea și deployment-ul

Întreaga aplicație a fost containerizată pentru a permite atât rularea consistentă în dezvoltare locală, cât și deployment-ul rapid în producție pe platforme cloud.

### III.8.1 Dockerfile multi-stage pentru backend

`CreditApp.API/Dockerfile` definește un build multi-stage care produce o imagine de producție minimă:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CreditApp.API/CreditApp.API.csproj", "CreditApp.API/"]
COPY ["CreditApp.Application/CreditApp.Application.csproj", "CreditApp.Application/"]
COPY ["CreditApp.Domain/CreditApp.Domain.csproj", "CreditApp.Domain/"]
COPY ["CreditApp.Infrastructure/CreditApp.Infrastructure.csproj", "CreditApp.Infrastructure/"]
RUN dotnet restore "CreditApp.API/CreditApp.API.csproj"
COPY . .
RUN dotnet publish "CreditApp.API/CreditApp.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CreditApp.API.dll"]
```

Stage-ul `build` folosește SDK-ul complet .NET (mare, ~700MB) pentru a compila aplicația. Stage-ul final folosește runtime-ul ASP.NET Core minim (~200MB) și include doar binarele compilate. Această separare reduce dimensiunea imaginii finale cu ~70% și diminuează suprafața de atac (lipsa SDK-ului înseamnă lipsa compilatorului și a uneltelor de development în imaginea de producție).

### III.8.2 Dockerfile pentru frontend cu Nginx

`frontend/Dockerfile` urmează același principiu multi-stage. Stage-ul `build` rulează `npm install` și `npm run build` pentru a produce bundle-ul static în `dist/`. Stage-ul final folosește o imagine **Nginx Alpine** (~25MB) și servește bundle-ul prin Nginx cu o configurare specifică SPA:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Această directivă rezolvă problema clasică a aplicațiilor SPA: rutele client-side (de exemplu, `/clients/123`) trebuie să fie servite din `index.html`, care apoi încarcă React Router-ul care interpretează URL-ul.

### III.8.3 Orchestrare locală cu docker-compose

Pentru dezvoltarea locală, `docker-compose.yml` orchestrează toate serviciile necesare:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: creditapp
      POSTGRES_USER: creditapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI
  
  api:
    build:
      context: .
      dockerfile: CreditApp.API/Dockerfile
    environment:
      ConnectionStrings__DefaultConnection: "..."
      JwtSettings__SecretKey: ${JWT_SECRET}
    ports:
      - "5286:8080"
    depends_on: [db, mailhog]
  
  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:80"
    depends_on: [api]
```

Cu o singură comandă (`docker-compose up`) se pornește întreaga stivă (Postgres, MailHog, API, Frontend), iar utilizatorul poate accesa aplicația la `http://localhost:5173`. Această abordare elimină complet pașii manuali de configurare a mediului de dezvoltare și garantează că toți dezvoltatorii (și CI-ul) folosesc exact aceeași configurare.

### III.8.4 Deployment în producție

Aplicația rulează în producție pe trei platforme cloud distincte, fiecare specializată pe o componentă:

**Backend pe Render** (`https://credit-loan-system.onrender.com`) — Render este o platformă PaaS care construiește imaginea Docker direct din repository-ul GitHub la fiecare push pe branch-ul main. Setarea cheie este `Dockerfile Path: ./CreditApp.API/Dockerfile` cu `Build Context: .` (pentru ca Dockerfile-ul să poată copia toate proiectele din soluție). Variabilele de mediu (connection string Supabase, JWT secret, Anthropic API key, Resend API key, origini CORS) sunt setate prin dashboard.

**Frontend pe Vercel** (`https://credit-loan-system.vercel.app`) — Vercel este specializat pe aplicații frontend statice și oferă deployment cu zero configurare pentru proiecte Vite. Singura configurare custom este `vercel.json` pentru rewrites SPA (echivalentul `try_files` din Nginx). Variabila `VITE_API_URL` indică URL-ul backend-ului pe Render.

**Bază de date pe Supabase** (`aws-0-eu-central-1.pooler.supabase.com`) — Supabase oferă PostgreSQL hostat cu Session Pooler care permite conexiuni transient prin port 5432. Aplicația se conectează prin connection string care include credențialele, SSL mode (`Require`) și parametrul `TrustServerCertificate=true` (necesar pentru Render, care nu are CA bundle-ul complet).

**Resend pentru email** — sender configurat ca `onboarding@resend.dev` (nu necesită verificare de domeniu pentru demo). API key-ul este setat ca variabilă de mediu pe Render.

Această topologie distribuită — cu fiecare componentă pe platforma cea mai potrivită pentru ea — oferă atât scalabilitate (fiecare layer poate crește independent), cât și costuri minime (toate cele patru servicii au tier gratuit suficient pentru demo).

### III.8.5 Workflow de deployment

Procesul tipic de deployment:

1. Dezvoltatorul face modificări locale, testează cu `docker-compose up`
2. Commit + push pe branch-ul `main` (sau feature branch + PR)
3. Render detectează push-ul automat și începe rebuild-ul backend-ului (~3-5 min)
4. Vercel detectează push-ul automat și începe rebuild-ul frontend-ului (~1-2 min)
5. La success, ambele deploys sunt vizibile public

Acest workflow continuous-deployment elimină pașii manuali și reduce timpul de la commit la producție la sub 5 minute.

## III.9 Testarea aplicației

Pentru o aplicație de complexitatea CreditWise, dezvoltată ca proiect academic individual cu termen limitat, strategia de testare a fost prioritizată pragmatic — concentrând efortul asupra testării manuale end-to-end a fluxurilor critice de business, în detrimentul scrierii unei suite complete de teste unitare automate.

### III.9.1 Decizia de strategie

Există în industrie un spectru larg al practicilor de testare, de la "TDD complet" (test-driven development cu acoperire >90%) la "manual smoke testing" (testare manuală a fluxurilor critice). Alegerea pentru proiectul de licență a fost mai aproape de al doilea pol, dintr-un motiv pragmatic: într-o aplicație cu 29 de endpoint-uri și aproximativ 14 pagini de UI, scrierea testelor automate ar fi consumat aproximativ același timp ca implementarea funcționalităților în sine. Întrucât scopul lucrării este să demonstreze **complexitatea sistemului implementat**, nu **acoperirea de teste**, prioritatea a fost dezvoltarea de funcționalități end-to-end testate manual.

### III.9.2 Postman Collection ca documentație live

Pentru a oferi o modalitate sistematică de testare a API-ului, a fost creată o **colecție Postman** completă în fișierul `postman/CreditApp.postman_collection.json`. Aceasta include toate cele 29 de endpoint-uri ale aplicației, organizate pe grupuri (Auth, Clients, CreditRequests, Decisions, Users, Dashboard, Reports, Transactions, Chat, UserPreferences). Fiecare endpoint are:

- URL-ul complet cu placeholders pentru parametri (`{{baseUrl}}`, `{{token}}`)
- Header-ele necesare (în special Authorization Bearer)
- Body de exemplu pentru cele POST/PUT
- Descriere a comportamentului așteptat

Colecția folosește **variables Postman** pentru a permite comutarea ușoară între medii (local vs producție Render) prin modificarea unei singure variabile. La login, scriptul de post-response salvează automat JWT-ul în variabila `{{token}}`, eliminând necesitatea copy-paste-ului manual.

Această colecție servește simultan trei scopuri: **testare manuală** (rulează request-uri și verifică răspunsurile), **documentație** (orice dezvoltator nou poate explora rapid API-ul), **demonstrație** (în cadrul prezentării lucrării, demo-ul live poate folosi Postman pentru a arăta funcționarea endpoint-urilor).

### III.9.3 Scenarii de testare end-to-end

Au fost identificate și verificate manual următoarele scenarii critice:

**Scenariul 1: Flow complet credit aprobat**
1. Login ca Admin → creează un Analyst nou
2. Logout, login ca Analyst → adaugă un client nou cu venit ridicat
3. Creează o cerere de credit cu sumă moderată (ar trebui scoring >70)
4. Verifică că analiștii activi cu preferință pornită primesc email (în MailHog)
5. Deschide panel de decizii → aprobă cererea cu sumă și rată
6. Verifică că clientul primește email de aprobare
7. Verifică că cererea apare în Tranzacții cu calcul corect al ratei

**Scenariul 2: Flow complet credit respins**
- Similar cu Scenariul 1, dar cu client cu venit redus și sumă mare → scoring scăzut → respingere → email respingere către client

**Scenariul 3: Invalidare token prin schimbarea parolei**
1. Login → reține JWT-ul (din DevTools)
2. Schimbă parola din Settings
3. Restaurează JWT-ul vechi în request → verifică că primește 401

**Scenariul 4: Rate limiting pe login**
1. Cinci tentative consecutive de login cu parolă greșită
2. A șasea tentativă → primește 429 Too Many Requests
3. Așteaptă un minut → tentativa funcționează din nou

**Scenariul 5: Test chatbot AI cu tools**
1. Login → deschide ChatPanel
2. "Câte cereri pending sunt acum?" → verifică că model-ul apelează `search_credit_requests` cu status=Pending
3. "Cine este clientul cu CNP 1900101..." → verifică `search_clients` + răspuns concret
4. "Cât a aprobat analistul X luna trecută?" → verifică sumare corecte
5. Inspectează în UI trace-urile tool call-urilor afișate sub răspunsuri

**Scenariul 6: Roluri și autorizare**
1. Login ca Banker → încearcă să accesezi `/users` → redirect la dashboard
2. Login ca Banker → trimite request POST `/api/decisions` direct cu Postman → primește 403 Forbidden
3. Login ca Analyst → verifică că nu vede butonul "Delete client" în UI și nu poate trimite DELETE prin Postman

**Scenariul 7: Cross-browser și responsive**
1. Aplicația deschisă în Chrome, Firefox și Edge → toate funcționează identic
2. DevTools → responsive mode → testare la 360px (mobile), 768px (tablet), 1280px (desktop)
3. Verifică că Sidebar-ul se transformă în drawer pe mobile, KPI cards trec de la 4 coloane la 1 etc.

### III.9.4 Verificarea integrității datelor

Pe lângă scenariile end-to-end, au fost realizate verificări de integritate a bazei de date:

- Tentativa de a crea două Decisions pentru aceeași CreditRequest → blocată prin constraint unic
- Tentativa de a șterge un Client cu cereri existente → blocată prin FK RESTRICT
- Tentativa de a crea două Users cu același email → blocată prin index unic
- Tentativa de a crea două UserPreferences pentru același User → blocată prin index unic pe UserId

Toate aceste verificări confirmă că restricțiile de integritate funcționează atât la nivel aplicație (cod), cât și la nivel bază de date (constraints SQL).

### III.9.5 Limitări ale strategiei adoptate

Strategia de testare adoptată are limitări recunoscute:

1. **Lipsa testelor unitare** înseamnă că refactorizările majore necesită retestare manuală integrală
2. **Lipsa testelor automate de regresie** înseamnă că introducerea unor bug-uri vechi reapărute (regresii) ar putea fi detectată doar prin testare manuală
3. **Lipsa testelor de performanță** sub încărcare înseamnă că nu există măsurători exacte ale comportamentului aplicației la, de exemplu, 1000 utilizatori concurenți

Aceste limitări sunt acceptabile în contextul unui proiect academic individual cu termen limitat, dar reprezintă o direcție clară de îmbunătățire pentru o eventuală evoluție a sistemului în mediu de producție real (vezi capitolul **CONCLUZII ȘI PROPUNERI DE DEZVOLTARE**).

---

În acest batch al Capitolului III au fost prezentate componentele specializate ale aplicației: asistentul AI cu Tool Use, sistemul dual-provider de email, măsurile de securitate stratificate, containerizarea Docker cu deployment cloud distribuit și strategia pragmatică de testare. Împreună cu Batch A, capitolul oferă o imagine completă a modului în care aplicația CreditWise a fost implementată concret, de la schema bazei de date și până la deployment-ul în producție.
