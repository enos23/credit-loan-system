# CAPITOLUL II: MODUL DE IMPLEMENTARE A APLICAȚIEI

În capitolul precedent au fost prezentate tehnologiile care formează fundația tehnică a aplicației. În cel de față, accentul se mută de la *unelte* la *decizii arhitecturale*: cum a fost gândit procesul de dezvoltare, ce cerințe trebuie să satisfacă sistemul, cum sunt organizate componentele între ele, cum se modelează datele și care sunt fluxurile logice principale între actorii sistemului. Capitolul include de asemenea descrierea algoritmului de evaluare a riscului, considerațiile arhitecturale legate de scalabilitate și deciziile de securitate luate încă din faza de proiectare.

## II.1 Planificarea procesului de dezvoltare

Pentru dezvoltarea aplicației CreditWise s-a adoptat o metodologie **iterativ-incrementală**, inspirată de principiile Agile, dar adaptată la contextul unui proiect cu un singur dezvoltator. În locul unui plan rigid în cascadă, în care toate cerințele ar fi fost definite în avans și implementarea ar fi urmat o ordine strictă, dezvoltarea a fost organizată în **iterații funcționale**, fiecare iterație rezultând într-o versiune funcțională a aplicației, capabilă să fie testată end-to-end.

Procesul de dezvoltare a fost structurat în cinci faze majore, fiecare cu obiective bine delimitate:

1. **Faza de fundație** — modelarea inițială a entităților, configurarea proiectului .NET (structurat de la început pe cele patru layere ale Clean Architecture), integrarea Entity Framework Core și definirea schemei inițiale a bazei de date.

2. **Faza de funcționalități core** — implementarea CRUD-ului pentru entitățile principale (utilizatori, clienți, cereri de credit), autentificarea cu JWT, ecranele principale din interfața utilizator (Login, Dashboard, lista clienți, lista cereri).

3. **Faza de business logic** — sistemul de scoring automat, workflow-ul decizional al analistului, gestionarea preferințelor utilizatorilor, distribuția deciziilor între roluri.

4. **Faza de diferențiere** — integrarea asistentului AI bazat pe Claude Tool Use, implementarea sistemului de email notificări, optimizările de performanță (paginare server-side, agregate cached).

5. **Faza de producție** — containerizarea cu Docker, deployment-ul pe platformele cloud (Vercel, Render, Supabase), responsive design pentru mobil, documentarea exhaustivă a proiectului prin diagrame UML și README.

Versionarea codului a fost realizată exclusiv prin **Git**, cu remote pe **GitHub**. Strategia de branching adoptată a fost una simplificată, în care fiecare feature majoră a fost dezvoltată pe un branch propriu (de exemplu, `feature/ai-chatbot`, `feature/email-notifications`, `feature/responsive-ui`), integrarea făcându-se prin **pull request-uri** după validarea funcționalității. Această abordare a permis menținerea unui istoric Git curat, în care fiecare etapă majoră este vizibilă printr-un commit de merge.

Pentru identificarea și remedierea problemelor în fazele inițiale s-a efectuat un **audit complet al codului**, în urma căruia au fost identificate 42 de îmbunătățiri potențiale, grupate pe categorii (bug-uri critice, vulnerabilități de securitate, anti-pattern-uri arhitecturale, oportunități de refactorizare). Aceste îmbunătățiri au fost prioritizate și aplicate sistematic, fiecare grup primind propriul branch dedicat (de exemplu, `fix/critical-bugs`, `chore/cleanup-batch`), urmate de procesul standard de merge.

## II.2 Analiza cerințelor funcționale și nefuncționale

Înainte de a începe implementarea propriu-zisă, au fost formalizate cerințele aplicației, structurate pe două categorii standard: **funcționale** (ce trebuie să facă sistemul) și **nefuncționale** (cum trebuie să funcționeze sistemul în termeni de performanță, securitate, mentenabilitate).

### Cerințe funcționale

Sistemul trebuie să implementeze următoarele funcționalități principale, grupate pe arii:

**Autentificare și management utilizatori:**
- Login cu email și parolă pentru utilizatorii interni (Admin, Analyst, Banker)
- Logout cu invalidarea sesiunii curente
- Resetarea parolei prin email cu token cu expirare
- Schimbarea parolei pentru utilizatorul autenticat
- Actualizarea profilului personal (nume, telefon, bio, culoare avatar)
- Crearea, editarea și dezactivarea conturilor de utilizator (doar pentru Admin)

**Gestionare clienți:**
- Înregistrarea unui client nou cu validare CNP unic
- Editarea datelor clienților existenți
- Ștergerea unui client (doar pentru Admin, doar dacă nu are cereri active)
- Listare cu paginare și căutare după nume, email sau CNP
- Vizualizarea profilului detaliat al unui client

**Cereri de credit:**
- Crearea unei cereri noi, cu calculul automat al scorului de credit și nivelului de risc
- Listarea paginată a cererilor, cu filtrare și căutare
- Vizualizarea detaliilor unei cereri, inclusiv decizia asociată (dacă există)
- Actualizarea status-ului unei cereri (pentru Admin și Analyst)

**Workflow decizional:**
- Vizualizarea cererilor în așteptare în panoul analistului
- Aprobarea unei cereri cu sumă aprobată, dobândă și note interne
- Respingerea unei cereri cu justificare
- Solicitarea de informații suplimentare

**Analytics și rapoarte:**
- Dashboard cu KPI agregat (clienți totali, cereri totale, rate de aprobare, sume disbursate)
- Distribuția cererilor pe status și pe nivel de risc
- Trend lunar al activității în ultimele 6 luni
- Performanța analiștilor (număr cereri procesate, rate de aprobare individuale)
- Lista tranzacțiilor de disbursare cu sume și rate de dobândă

**Asistent AI:**
- Interogare în limbaj natural asupra datelor aplicației
- Răspunsuri bazate pe tools predefinite, filtrate per rol
- Conversație multi-turn păstrată local în browser

**Notificări:**
- Email automat trimis clientului la finalizarea unei decizii
- Email broadcast trimis analiștilor și administratorilor la apariția unei cereri noi
- Email de resetare parolă cu link cu token

**Personalizare:**
- Persistența preferințelor utilizatorului (notificări active, înregistrări per pagină, limbă, format dată, temă vizuală)

### Cerințe nefuncționale

În paralel cu cerințele funcționale, au fost stabilite următoarele cerințe nefuncționale:

- **Securitate**: parole hash-uite cu BCrypt (cost 11), JWT cu expirare de 7 zile și invalidare imediată prin SecurityStamp, rate limiting per IP pe endpoint-urile de autentificare (5 req/min) și per utilizator pe chat-ul AI (20 req/5 min), validare strictă a tipurilor de input la limita sistemului, protecție împotriva atacurilor XSS prin escapare automată a output-ului React, protecție împotriva injecției SQL prin utilizarea exclusivă a query-urilor parametrizate Entity Framework Core.

- **Performanță**: paginare server-side pentru listele cu volum potențial mare (clienți, cereri), agregate calculate direct în baza de date pentru dashboard și rapoarte, prompt caching pentru reducerea costurilor și latenței la interacțiunile AI repetate, indexare unică pe coloanele frecvent interogate (email pentru users, CNP pentru clienți).

- **Scalabilitate**: arhitectură stateless la nivelul backend-ului (sesiunile fiind înlocuite cu JWT-uri auto-conținute), posibilitatea de a rula multiple instanțe paralele ale aplicației fără sincronizare suplimentară, design al schemei bazei de date care să suporte volume de ordinul a sute de mii de înregistrări per tabel fără degradare perceptibilă.

- **Mentenabilitate**: separare strictă a responsabilităților prin Clean Architecture, testabilitate prin inversiune de dependențe, gestionare centralizată a erorilor prin middleware ProblemDetails, configurare prin variabile de mediu și zero credențiale în repository.

- **Portabilitate**: containerizare completă a aplicației prin Docker, posibilitatea de a rula întregul stack local printr-o singură comandă (`docker compose up`), independent de sistemul de operare al dezvoltatorului.

- **Disponibilitate**: posibilitatea de a fi deploy-ată pe platforme cloud cu redeploy automat la fiecare commit pe branch-ul principal, configurabilitate flexibilă pentru CORS, URL-uri și credențiale per mediu.

## II.3 Proiectarea arhitecturii Clean Architecture

Una dintre deciziile fundamentale luate la începutul dezvoltării a fost adoptarea arhitecturii **Clean Architecture**, propusă de Robert C. Martin (cunoscut și sub pseudonimul "Uncle Bob"). Această arhitectură urmărește separarea preocupărilor între diferitele responsabilități ale unei aplicații prin organizarea codului pe straturi concentrice, cu o **regulă strictă de dependență**: dependențele se orientează doar dinspre exterior spre interior, niciodată invers.

Structura completă a proiectului este prezentată în Figura II.1 (vezi `docs/diagrams/exports/architecture.png`). Cele patru layere și responsabilitățile lor sunt:

**1. Domain Layer (`CreditApp.Domain`)** — Reprezintă inima sistemului. Conține entitățile pure ale domeniului (User, Client, CreditRequest, Decision, UserPreference), enumerările (UserRole, CreditStatus, RiskLevel, DecisionType) și interfețele repository-urilor. Acest layer **nu depinde de niciun alt layer** și nu cunoaște nimic despre Entity Framework, ASP.NET sau bibliotecile externe. Independența domeniului permite testarea izolată a regulilor de business și înlocuirea ușoară a infrastructurii.

**2. Application Layer (`CreditApp.Application`)** — Conține logica de business sub formă de servicii (de exemplu, `ClientService`, `CreditRequestService`, `DecisionService`, `ChatService`, `UserPreferenceService`), DTO-uri pentru comunicarea cu nivelul exterior, interfețe pentru query-uri specializate (`IDashboardQueries`, `IReportsQueries`), validări (PasswordValidator), excepții custom (NotFoundException, ConflictException) și configurări (JwtSettings, EmailSettings, AnthropicSettings). Application depinde exclusiv de Domain.

**3. Infrastructure Layer (`CreditApp.Infrastructure`)** — Implementează concret toate interfețele declarate în Domain și Application. Aici se află `AppDbContext` (Entity Framework Core), implementările repository-urilor și query-urilor, clientul HTTP pentru Anthropic, serviciile de email (SmtpEmailService și ResendEmailService) și mecanismele de configurare a bazei de date. Infrastructure depinde de Application și Domain, dar nu este referențiat direct de Application — relația se realizează prin injecție de dependență.

**4. API Layer (`CreditApp.API`)** — Este punctul de intrare în aplicație. Conține controller-ele REST, middleware-urile (autentificare JWT cu validare SecurityStamp, rate limiting, ProblemDetails pentru erori), configurarea pipeline-ului HTTP, înregistrarea serviciilor în containerul DI și logica de seed pentru utilizatorul Admin inițial. API depinde de toate celelalte layere.

Beneficiile concrete observate pe parcursul dezvoltării au fost multiple:

- **Modificările în infrastructură nu afectează logica de business**. De exemplu, descoperirea că Render blochează SMTP outbound a impus introducerea unei a doua implementări de `IEmailService` (`ResendEmailService` peste HTTP REST). Această schimbare s-a făcut exclusiv în Infrastructure, fără nicio modificare în servicii sau controllere.
- **Testarea unei reguli de business** (de exemplu, scoring-ul) se poate face fără infrastructură (fără bază de date, fără rețea), prin instanțierea directă a `ScoringService` cu obiecte mock.
- **Evoluția schemei bazei de date** este izolată de logica de business — adăugarea unui câmp nou într-o entitate necesită modificări doar în Domain și o migrație EF în Infrastructure.

## II.4 Modelarea bazei de date (schema ER)

Modelul de date al aplicației este organizat în jurul a **cinci entități principale**, conectate prin relații explicit declarate cu chei externe. Diagrama Entity-Relationship este prezentată în Figura II.2 (vezi `docs/diagrams/exports/er-diagram.png`).

### Entitățile

**Users** — utilizatorii interni ai sistemului. Câmpuri principale: `Id` (UUID, cheie primară), `Email` (cu index unic), `PasswordHash` (BCrypt), `FirstName`, `LastName`, `Role` (enum: 0=Admin, 1=Analyst, 2=Banker), `IsActive` (boolean pentru soft delete), `SecurityStamp` (UUID regenerat la fiecare schimbare critică), `ResetPasswordToken` și `ResetPasswordTokenExpiry` (pentru fluxul de resetare prin email). Câmpurile de profil opționale (`Phone`, `Bio`, `AvatarGradient`) permit personalizarea contului.

**Clients** — solicitanții de credit. Câmpuri principale: `Id` (UUID), `CNP` (13 caractere, cu index unic — un client unic per CNP), `FirstName`, `LastName`, `Email`, `Phone`, `DateOfBirth`, `Address`, `EmploymentStatus` (enum), `MonthlyIncome` și `MonthlyExpenses` (decimal cu precizie 18,2). Spre deosebire de Users, clienții **nu au cont** în aplicație — sunt entități pasive, gestionate exclusiv de utilizatorii interni.

**CreditRequests** — cererile de credit înregistrate pentru clienți. Câmpuri principale: `Id`, `ClientId` (FK către Clients, comportament Restrict la ștergere), `AssignedAnalystId` (FK opțional către Users, comportament SetNull la ștergere), `Amount`, `TermMonths`, `Purpose`, `Status` (enum: Pending, UnderReview, Approved, Rejected), `CreditScore` (0-100, calculat la creare), `RiskLevel` (enum: Low, Medium, High), `CreatedAt`, `UpdatedAt`.

**Decisions** — deciziile luate de analiști asupra cererilor. Câmpuri principale: `Id`, `CreditRequestId` (FK către CreditRequests, **index unic** — o singură decizie per cerere, comportament Cascade la ștergere), `AnalystId` (FK către Users, comportament Restrict — pentru a păstra audit trail-ul), `DecisionType` (Approved, Rejected, NeedsMoreInfo), `InterestRate`, `ApprovedAmount`, `Notes`.

**UserPreferences** — preferințele individuale ale fiecărui utilizator. Câmpuri principale: `Id`, `UserId` (FK unic către Users, Cascade la ștergere — preferințele dispar odată cu utilizatorul), patru câmpuri boolean pentru notificări (`NotifyEmailNewRequest`, `NotifyEmailDecision`, `NotifyBrowserAlerts`, `NotifyWeeklyReport`), `Language`, `DateFormat`, `ItemsPerPage`, `Theme`.

### Relațiile

Cele cinci relații dintre entități, cu comportamentele de cascade explicit configurate, sunt:

| De la | La | Cardinalitate | Comportament la ștergere |
|---|---|---|---|
| Clients | CreditRequests | 1 — N | Restrict (un client nu poate fi șters dacă are cereri) |
| Users | CreditRequests.AssignedAnalystId | 1 — N | SetNull (cererea rămâne, dar devine neasignată) |
| CreditRequests | Decisions | 1 — 1 | Cascade (ștergerea cererii șterge decizia) |
| Users | Decisions.AnalystId | 1 — N | **Restrict** (analiștii cu decizii nu pot fi șterși — audit trail) |
| Users | UserPreferences | 1 — 1 | Cascade (preferințele dispar cu utilizatorul) |

Decizia de a folosi **Restrict** pe `Decisions.AnalystId` este o alegere conștientă: într-un sistem bancar real, urmărirea cine a luat ce decizie reprezintă o cerință legală de **audit trail**, iar permiterea ștergerii unui analist ar însemna pierderea contextului istoric al deciziilor. Soft delete-ul (`IsActive = false`) rămâne mecanismul corect pentru "scoaterea din uz" a unui analist, fără a-i șterge contul fizic.

### Normalizarea

Schema bazei de date respectă **Forma Normală a Treia (3NF)**: fiecare câmp non-cheie depinde direct și exclusiv de cheia primară a tabelului din care face parte, fără tranzitivități. Câmpurile derivate (de exemplu, suma disbursată totală sau rata de aprobare) nu sunt stocate ci sunt calculate dinamic prin agregate la nivelul serviciilor `DashboardService` și `ReportsService`, evitând astfel inconsistența care ar putea apărea în cazul unor modificări ulterioare.

## II.5 Actorii sistemului și rolurile (diagrama use case)

Sistemul CreditWise este destinat utilizatorilor interni ai unei instituții bancare. Au fost identificați trei actori principali, fiecare cu un set distinct de permisiuni și responsabilități. Diagrama Use Case completă este prezentată în Figura II.3 (vezi `docs/diagrams/exports/use-cases.png`).

### Administrator (Admin)

Reprezintă cel mai înalt nivel de acces în sistem. Are dreptul de a:
- Crea, edita și dezactiva conturi de utilizator
- Modifica rolurile altor utilizatori (cu invalidarea sesiunii vechi prin regenerarea SecurityStamp-ului)
- Realiza toate operațiunile disponibile analiștilor și bancherilor
- Șterge clienții din sistem (dacă nu au cereri active asociate)
- Accesa asistentul AI fără restricții de tool-uri

În practică, rolul de Administrator este atribuit personalului tehnic / managementului bancar și este responsabil de provisioning-ul conturilor pentru analiștii și bancherii activi.

### Analyst (Analist de credit)

Este utilizatorul central al sistemului, responsabil de procesul decizional propriu-zis. Are dreptul de a:
- Vizualiza toate cererile de credit, indiferent dacă i-au fost asignate explicit
- Lua decizii (aprobare, respingere, solicitare informații suplimentare) asupra cererilor
- Accesa istoricul deciziilor și note-le interne ale altor analiști
- Vizualiza tranzacțiile de disbursare
- Folosi asistentul AI cu acces complet la tool-urile read-only

Rolul Analyst este atribuit personalului specializat în evaluarea riscului de credit, având autoritatea de a influența direct fluxul de bani prin deciziile luate.

### Banker (Bancher)

Reprezintă personalul de front-office, responsabil de interacțiunea directă cu clienții. Are dreptul de a:
- Crea, edita clienți noi
- Înregistra cereri noi de credit pentru clienții cu care interacționează
- Vizualiza cererile existente, dar **fără** a vedea note-le interne ale analiștilor sau detalii ale tranzacțiilor disbursate

Bancherul are vizibilitate **redusă** asupra workflow-ului decizional intern, fiind izolat de informațiile sensibile (de exemplu, justificările respingerilor) care nu sunt necesare pentru rolul său. Această izolare se reflectă atât în restricțiile API (`[Authorize(Roles="...")]`), cât și în filtrarea tool-urilor disponibile asistentului AI pentru utilizatorii cu acest rol.

### Funcționalități partajate

Anumite funcționalități sunt accesibile tuturor celor trei actori autenticați:
- Login, logout, schimbare parolă, reset parolă prin email
- Actualizarea profilului personal
- Configurarea preferințelor (notificări, paginare, temă)
- Vizualizarea dashboard-ului cu statistici agregate
- Vizualizarea rapoartelor
- Listarea și căutarea clienților și cererilor de credit

Aceste funcționalități constituie nucleul comun al sistemului, care permite oricărui utilizator intern să se orienteze în date și să-și gestioneze propriul cont.

## II.6 Definirea fluxurilor logice (diagrama de secvență)

Pentru a ilustra interacțiunile complexe între componentele sistemului, a fost realizată o **diagramă de secvență** pentru cel mai relevant flux de business: crearea unei cereri de credit, evaluarea automată a riscului, notificarea analiștilor, luarea deciziei și transmiterea răspunsului către client. Diagrama completă este prezentată în Figura II.4 (vezi `docs/diagrams/exports/sequence-credit-flow.png`).

Fluxul integrează **toate componentele majore** ale aplicației — interfață, autentificare, validare, servicii de business, scoring, repository-uri, baza de date și serviciul de email — și se desfășoară în patru faze succesive:

### Faza 1 — Înregistrarea cererii

Un bancher autentificat completează formularul de creare a unei cereri noi și trimite un POST `/api/CreditRequests`. Middleware-ul de autentificare validează token-ul JWT, inclusiv verificarea SecurityStamp-ului. Apoi middleware-ul de autorizare verifică că utilizatorul are unul dintre rolurile permise (Admin, Analyst, Banker). Cererea ajunge la `CreditRequestsController`, care delegă către `CreditRequestService.CreateAsync()`.

Serviciul verifică existența clientului prin repository, calculează scorul de credit prin `ScoringService` (vezi II.7 pentru detalii), determină nivelul de risc și salvează cererea cu status-ul **Pending**. Răspunsul `201 Created` este returnat client-ului împreună cu detaliile cererii nou create.

### Faza 2 — Notificarea analiștilor

În aceeași tranzacție, după salvarea cererii, `CreditRequestService` declanșează notificarea analiștilor. Listează toți utilizatorii activi, filtrează după rol (Admin sau Analyst) și interoghează `UserPreferenceRepository` pentru a verifica setarea `NotifyEmailNewRequest` pentru fiecare. Utilizatorii care au optat pentru această notificare (sau cei care nu au încă o preferință stocată — default este `true`) primesc un email prin `IEmailService.Enqueue()`.

Trimiterea email-urilor se face în mod **fire-and-forget**: `Enqueue` nu așteaptă confirmarea livrării, ci pornește un `Task.Run` care contactează SMTP-ul (în dev) sau REST API-ul Resend (în prod) în fundal. Eventualele eșecuri sunt logate, dar nu afectează răspunsul HTTP către utilizatorul care a creat cererea.

### Faza 3 — Decizia analistului

Un analist autentificat deschide panoul său (`/decisions`) și vede cererea Pending. După analiză, completează un formular cu suma aprobată, dobânda și note interne, apoi confirmă decizia (`POST /api/Decisions`). Cererea este validată: trebuie să existe; trebuie să nu existe deja o decizie pentru ea (relație 1-1); decizia trebuie să fie de tip valid (Approved, Rejected sau NeedsMoreInfo).

`DecisionService.CreateAsync()` salvează decizia, actualizează status-ul cererii (Approved sau Rejected — NeedsMoreInfo lasă cererea în starea Pending) și declanșează notificarea clientului.

### Faza 4 — Notificarea clientului

Pentru deciziile finale (Approved sau Rejected), `DecisionService` apelează `IEmailService.Enqueue()` cu un template specializat, populat cu datele clientului și ale deciziei. Email-ul este trimis către adresa clientului, conținând rezultatul (aprobat/respins) și, în cazul aprobării, detaliile financiare (suma aprobată, rata dobânzii, durata în luni).

Fluxul complet ilustrează cum **principiile arhitecturale** prezentate în secțiunile anterioare (autentificare stateless cu JWT, validare la limita sistemului, separarea logicii de business în servicii, comunicare asincronă cu serviciile externe) se traduc în interacțiuni concrete între componentele sistemului.

## II.7 Sistemul de evaluare a riscului (scoring ponderat)

Una dintre componentele centrale ale aplicației este **sistemul automatizat de evaluare a riscului de credit**, implementat în clasa `ScoringService`. Spre deosebire de sistemele bancare reale, care utilizează modele complexe de machine learning antrenate pe date istorice, în CreditWise s-a optat pentru un **sistem ponderat cu reguli explicite**, mai potrivit pentru contextul academic și pentru transparența procesului decizional.

Decizia conștientă de a folosi un sistem bazat pe reguli, în locul unui model ML, a fost motivată de:

- **Transparența** — fiecare punct din scor poate fi justificat printr-o regulă verificabilă, ceea ce permite analistului să înțeleagă de ce o cerere a primit un anumit scor
- **Reproductibilitatea** — același set de date va produce mereu același scor, fără variația inerentă a modelelor probabilistice
- **Absența nevoii de date istorice** — un model ML ar fi necesitat un dataset de antrenament cu cereri reale și deciziile corespunzătoare, indisponibile în contextul academic
- **Demonstrarea conceptelor de scoring** — un sistem ponderat ilustrează clar **principiile generale** ale evaluării de credit (raport datorii/venit, stabilitate angajare etc.), fără complexitatea suplimentară a unui model probabilistic

### Cei patru factori

Scorul final este calculat pe o scară de la 0 la 100, prin însumarea contribuțiilor a patru factori, fiecare cu o pondere maximă predefinită:

**Factor 1: Rata de îndatorare** (pondere maximă: 30 puncte)

Reflectă proporția dintre cheltuielile totale ale solicitantului (cheltuieli lunare existente + rata estimată a creditului solicitat) și venitul său lunar. Cu cât raportul este mai mic, cu atât solicitantul are o capacitate financiară mai mare de a absorbi noul angajament. Rata lunară a creditului este aproximată prin `Sumă / Termen`, fără a încorpora dobânda (care va fi stabilită ulterior de către analist).

```
rata_creditului = sumă_solicitată / număr_luni
datorii_totale  = cheltuieli_lunare + rata_creditului
debt_ratio      = datorii_totale / venit_lunar
```

Punctaj acordat:
- 30 puncte: debt_ratio < 0.30 (sub 30%)
- 20 puncte: 0.30 ≤ debt_ratio < 0.40
- 10 puncte: 0.40 ≤ debt_ratio < 0.50
- 0 puncte: debt_ratio ≥ 0.50

**Factor 2: Stabilitatea angajării** (pondere maximă: 25 puncte)

Reflectă siguranța sursei de venit. Statutul de angajat oferă cea mai mare stabilitate; pensionarii au venit garantat dar potențial limitat; persoanele self-employed au venit variabil; șomerii sunt categoria cu cel mai mare risc.

Punctaj acordat:
- 25 puncte: Employed
- 20 puncte: Retired
- 15 puncte: SelfEmployed
- 0 puncte: Unemployed

**Factor 3: Raportul sumă cerută / venit anual** (pondere maximă: 25 puncte)

Reflectă proporționalitatea sumei solicitate față de capacitatea anuală de generare a venitului. O sumă reprezentând câteva luni de venit este rezonabilă; o sumă reprezentând zeci de ani este nepractic de rambursat.

```
income_ratio = sumă_solicitată / (venit_lunar × 12)
```

Punctaj acordat:
- 25 puncte: income_ratio < 12 (sub 12 luni de venit)
- 15 puncte: 12 ≤ income_ratio < 24
- 5 puncte: 24 ≤ income_ratio < 36
- 0 puncte: income_ratio ≥ 36

**Factor 4: Vârsta solicitantului** (pondere maximă: 20 puncte)

Reflectă maturitatea financiară și capacitatea estimată de a finaliza creditul în limita perioadei active de muncă.

Punctaj acordat:
- 20 puncte: 25 ≤ vârstă ≤ 55
- 15 puncte: 56 ≤ vârstă ≤ 65
- 10 puncte: 18 ≤ vârstă ≤ 24
- 0 puncte: alte intervale

### Interpretarea scorului

Suma maximă a celor patru factori este 100 de puncte. Scorul rezultat este interpretat astfel pentru clasificarea nivelului de risc:

- **80–100 puncte**: Risc scăzut (`Low`) — sugestie de aprobare cu dobândă preferențială (5.5%)
- **60–79 puncte**: Risc mediu (`Medium`) — sugestie de aprobare cu dobândă standard (9.0%)
- **0–59 puncte**: Risc ridicat (`High`) — sugestie de respingere sau aprobare cu dobândă mare (14.0%) și sumă redusă

Este important de subliniat că **decizia finală îi aparține întotdeauna analistului uman**. Scorul și nivelul de risc sunt prezentate doar ca asistare informațională — analistul poate suprascrie sugestia cu orice decizie, fiind responsabil pentru justificarea acesteia în câmpul de note interne.

## II.8 Strategii de scalabilitate

Deși proiectul a fost dezvoltat în contextul academic cu volume mici de date (zeci de clienți, zeci de cereri), arhitectura a fost gândită încă de la început pentru a putea acomoda volume realiste pentru o aplicație bancară (sute de mii de clienți, milioane de cereri). Trei decizii arhitecturale principale susțin această orientare.

### Paginare server-side

Endpoint-urile de listare (`/api/Clients`, `/api/CreditRequests`) nu returnează **niciodată** întreaga colecție, ci doar pagina cerută explicit prin parametrii `page` și `pageSize`. Implementarea utilizează metodele EF Core native `Skip` și `Take`, traduse în SQL nativ ca `OFFSET` și `LIMIT`, asigurând că serverul nu încarcă în memorie mai multe înregistrări decât are nevoie să returneze.

În plus, parametrul `pageSize` este **clamp-at server-side** la o valoare maximă de 1000, prevenind astfel atacurile de tip "denial of service prin paginare excesivă", în care un atacator ar putea încerca să descarce întreaga bază de date printr-un singur request.

### Agregate calculate în baza de date

Pentru endpoint-urile de tip dashboard și reports, care ar putea părea natural să încarce toate datele și să facă apoi calculele în memoria aplicației, s-a adoptat **strategia inversă**: calculele agregate (counts, sums, averages, group-by) sunt formulate prin LINQ-to-SQL și executate direct de PostgreSQL.

De exemplu, pentru a calcula distribuția cererilor pe nivel de risc, în loc să se încarce toate cererile în memorie și să se itereze peste ele:

```csharp
var rows = await _context.CreditRequests.AsNoTracking()
    .GroupBy(r => r.RiskLevel)
    .Select(g => new { Level = g.Key, Count = g.Count() })
    .ToListAsync();
```

Acest cod este tradus de EF Core într-un SQL nativ `SELECT "RiskLevel", COUNT(*) FROM "CreditRequests" GROUP BY "RiskLevel"`, care se execută în câteva milisecunde indiferent de mărimea tabelei, profitând de planurile de execuție optimizate de PostgreSQL. Beneficiul scalează direct cu volumul: pentru 1 milion de rânduri, varianta in-memory ar transfera prin rețea megabytes de date și ar consuma multă memorie; varianta SQL transferă doar cele 3 rânduri ale rezultatului final.

Aceeași abordare se aplică pentru:
- Calculul KPI-ului din Dashboard (total clienți, total cereri, rata de aprobare)
- Trend lunar (group by year-month)
- Performanța analiștilor (group by analyst + count)
- Distribuția pe scop credit (group by purpose)

### Prompt caching pentru AI

Pentru asistentul AI, costurile escaladează direct cu numărul de tokens trimise în fiecare request. Conversațiile multi-turn ar implica re-trimiterea repetată a prompt-ului de sistem (~800 de tokens) și a definițiilor celor șapte tools (~700 de tokens) — total ~1500 de tokens repetați la fiecare interacțiune.

Soluția adoptată este utilizarea funcționalității **prompt caching** oferite de API-ul Anthropic. Prin marcarea explicită cu `cache_control: { type: "ephemeral" }` a blocurilor de sistem și a definițiilor tools, prima cerere a unei sesiuni încarcă în cache aceste segmente, iar cererile ulterioare (în următoarele 5 minute) le accesează la un preț de aproximativ 10% din cel inițial. Rezultatul este o reducere a costului total cu **70–90%** pentru utilizatori cu sesiuni de mai multe turnuri.

## II.9 Decizii de securitate la nivel de design

Securitatea a fost tratată nu ca o caracteristică adăugată la final, ci ca o **considerație de bază** încă din faza de proiectare. Următoarele decizii structurale au fost luate cu scopul declarat de a reduce suprafața de atac a sistemului.

### Stateless authentication prin JWT

Sesiunile server-side tradiționale (cu cookie HTTP) prezintă mai multe vulnerabilități cunoscute (Cross-Site Request Forgery, session fixation, dificultatea revocării centralizate). JWT-urile stateless elimină aceste probleme prin transferul responsabilității de validare în token însuși, semnat cu o cheie secretă cunoscută doar de server. Adăugarea **SecurityStamp**-ului mitighează singurul dezavantaj al JWT-urilor: imposibilitatea revocării unui token înainte de expirare.

### Zero credențiale în repository

Toate credențialele sensibile (cheia de semnare JWT, stringul de conexiune la baza de date, cheile API pentru Anthropic și Resend, parola admin-ului inițial) sunt stocate **exclusiv** în `.NET User Secrets` (pentru dev) sau **variabile de mediu** (pentru producție). Repository-ul Git nu conține absolut nicio credențială, iar `appsettings.json` are toate câmpurile sensibile setate la string-uri goale.

### Validare la limita sistemului

DTO-urile primite prin API sunt validate **automat** prin middleware-ul ASP.NET Core, care interpretează atributele `[Required]`, `[EmailAddress]`, `[MaxLength]` etc. Pentru validări complexe (de exemplu, complexitatea parolei: minim 8 caractere, cel puțin o literă și o cifră), s-a creat o clasă utilitar `PasswordValidator` apelată explicit în servicii. Orice tentativă de a trimite date invalide returnează un răspuns `400 Bad Request` cu detaliile validării încă înainte de a ajunge la logica de business.

### Defense in depth pe autorizare

Autorizarea este verificată la **trei niveluri**: middleware-ul ASP.NET (`[Authorize(Roles="...")]`), serviciile (verificări de business pe rolul curent unde e necesar) și — pentru asistentul AI — filtrarea tool-urilor disponibile per rol. Această redundanță garantează că, în caz de bypass al unui nivel, celelalte continuă să protejeze accesul la date sensibile.

### Eroare-fără-leak

Middleware-ul global `GlobalExceptionHandler` interceptează toate excepțiile necătrate și returnează răspunsuri în format **ProblemDetails (RFC 7807)**, cu mesaje generice pentru erori 500 ("A apărut o eroare neașteptată"). Detaliile interne (stack trace-uri, mesaje SQL, structuri interne) **nu** ajung niciodată la client. Aceleași detalii sunt totuși logate server-side pentru ca dezvoltatorii să le poată investiga.

---

În acest capitol au fost prezentate principalele decizii arhitecturale și de design ale aplicației CreditWise, de la metodologia de dezvoltare și cerințele formale, la modelul de date și fluxurile logice, încheind cu strategiile de scalabilitate și securitate. În capitolul următor, accentul se va deplasa pe **detaliile concrete ale implementării** fiecărei componente, cu exemple de cod, capturi de ecran și descrierea pas cu pas a funcționalităților realizate.
