# CAPITOLUL I: TEHNOLOGII FOLOSITE

Pe parcursul dezvoltării aplicației CreditWise au fost selectate și integrate un ansamblu de tehnologii moderne, alese pe baza unor criterii multiple: maturitatea ecosistemului, adoptarea industrială, performanța, ușurința în mentenanță și existența unei comunități active de dezvoltatori. În acest capitol sunt prezentate, grupate pe niveluri arhitecturale, principalele tehnologii care formează stack-ul tehnic al aplicației, însoțite de justificarea alegerii fiecăreia.

## I.1 Nivelul de prezentare al interfeței aplicației

Nivelul de prezentare reprezintă acea parte a aplicației cu care interacționează direct utilizatorul final. Pentru CreditWise s-a optat pentru o arhitectură de tip **Single Page Application (SPA)**, în care interfața este construită ca o aplicație JavaScript autonomă care comunică cu serverul exclusiv prin apeluri către un API REST. Această abordare oferă o experiență de utilizare fluentă, comparabilă cu cea a aplicațiilor desktop native, în care navigarea între pagini nu necesită reîncărcarea completă a documentului HTML.

### I.1.1 React 19 cu JSX

**React** este o bibliotecă JavaScript open-source dezvoltată inițial de Meta (fosta Facebook), folosită pentru construcția interfețelor utilizator declarative și componente reutilizabile. Lansat pentru prima dată în 2013, React a devenit în prezent una dintre cele mai larg adoptate tehnologii pentru dezvoltarea frontend-ului modern, fiind utilizat de companii precum Netflix, Airbnb, Uber și nenumărate startup-uri de top.

Caracteristica fundamentală a React este modelul de componentă: interfața este descompusă într-o ierarhie de componente reutilizabile, fiecare componentă fiind responsabilă pentru o anumită parte vizuală și logică a aplicației. Această abordare se aliniază natural cu principiul de **separare a preocupărilor** și permite construcția de aplicații complexe prin compunerea componentelor mai simple.

În cadrul CreditWise s-a utilizat **React versiunea 19**, cea mai recentă versiune majoră, care include îmbunătățiri semnificative la nivel de performanță (Concurrent Features stabilizate), suport îmbunătățit pentru server components și un model de gestionare a stării sincronizate cu actualizările vizuale. Întreaga aplicație folosește exclusiv **function components** și pattern-ul de **React Hooks** introdus în versiunea 16.8 — `useState` pentru gestionarea stării locale, `useEffect` pentru efecte secundare (apeluri API, subscripții), `useContext` pentru partajarea stării globale și `useRef` pentru accesul la elemente DOM.

Sintaxa **JSX** (JavaScript XML) permite scrierea structurii vizuale a componentelor direct în codul JavaScript, într-o formă asemănătoare HTML-ului. JSX este transpilat în apeluri către `React.createElement()` la momentul build-ului, generând un arbore virtual al componentelor (Virtual DOM) care este apoi reconciliat eficient cu DOM-ul real, în urma fiecărei actualizări de stare. Această abordare elimină necesitatea manipulării directe a DOM-ului prin biblioteci precum jQuery și reduce semnificativ probabilitatea apariției unor inconsistențe între stare și interfață.

A fost luată în considerare și utilizarea TypeScript pentru tipuri statice, însă, pentru un proiect cu un singur dezvoltator și un timeline limitat, complexitatea adițională a configurării TypeScript a fost considerată un cost mai mare decât beneficiile obținute. Validarea tipurilor la limita sistemului este realizată prin Data Annotations pe partea de backend (cu mesaje de eroare returnate în format ProblemDetails) și prin componentele de input native HTML5 pe partea de frontend.

### I.1.2 Vite — build tool modern

**Vite** (din franceză, "rapid") este un build tool de generație nouă, dezvoltat de Evan You (autorul Vue.js), care abordează problemele de performanță întâlnite frecvent în uneltele tradiționale de build precum Webpack sau Parcel. Caracteristica distinctivă a lui Vite este utilizarea modulelor ES native (ES Modules) ale browser-elor moderne pentru dezvoltare, ceea ce elimină nevoia bundle-ării complete a codului sursă în timpul dezvoltării.

Avantajul principal pentru dezvoltator este viteza extrem de mare cu care serverul de dezvoltare pornește (sub o secundă, indiferent de mărimea proiectului) și actualizările instantanee prin **Hot Module Replacement (HMR)**, în care modificarea unui fișier este reflectată în browser fără a pierde starea aplicației.

Pentru build-ul de producție, Vite folosește **Rollup** intern, generând bundle-uri optimizate prin tehnici precum tree-shaking (eliminarea codului mort), code splitting (împărțirea automată în chunk-uri) și minificare avansată. Asset-urile statice primesc un hash în nume (de exemplu, `index-Dpe7HJ83.css`), ceea ce permite caching agresiv în browser, cu invalidare automată la fiecare rebuild.

O caracteristică importantă utilizată în CreditWise este sistemul de **variabile de mediu** al lui Vite, care permite expunerea anumitor configurări către codul client în timpul build-ului. Variabila `VITE_API_URL` este definită în fișierele `.env` corespunzătoare fiecărui mediu (`.env.development` pentru local, configurare manuală pe Vercel pentru producție) și este înlocuită static în codul compilat, eliminând astfel hardcodarea URL-urilor.

### I.1.3 Tailwind CSS și shadcn/ui

Stilizarea aplicației este realizată folosind **Tailwind CSS**, un framework CSS de tip **utility-first**, care propune o abordare diferită față de bibliotecile clasice precum Bootstrap sau Material-UI. În loc să ofere componente pre-stilizate, Tailwind expune un set extins de clase utilitare atomice (de exemplu, `flex`, `items-center`, `gap-4`, `bg-indigo-600`, `text-sm`), care pot fi combinate direct în markup-ul HTML/JSX pentru a obține orice stil dorit.

Această abordare prezintă mai multe avantaje practice: elimină nevoia de a inventa nume de clase CSS, evită problemele clasice de specificity și conflictele între reguli, permite obținerea unui design consistent (deoarece toate culorile, mărimile și spațiile provin dintr-o paletă predefinită) și produce bundle-uri CSS finale extrem de mici prin eliminarea automată a claselor neutilizate (purge CSS).

Pentru componente complexe (modale, dropdown-uri, tabel-uri sortabile) s-a folosit **shadcn/ui**, o colecție de componente React construite peste **Radix UI** (pentru accesibilitate) și stilizate cu Tailwind. Spre deosebire de bibliotecile tradiționale de componente, shadcn/ui nu este instalat ca dependență npm — în schimb, codul sursă al fiecărei componente este copiat direct în proiect (în directorul `src/components/ui/`), oferind dezvoltatorului control complet asupra stilizării și comportamentului fără a depinde de actualizările unei terțe părți.

Acest model permite, pe de o parte, customizarea profundă a fiecărei componente conform cerințelor specifice ale aplicației, iar pe de altă parte, eliminarea dependențelor versionate care ar putea introduce vulnerabilități de securitate sau probleme de compatibilitate în timp.

Pentru iconițe a fost utilizată biblioteca **lucide-react**, un fork modern al Feather Icons, care oferă peste 1000 de pictograme SVG vectoriale, ușor de importat ca și componente React.

### I.1.4 Recharts pentru vizualizarea datelor

Vizualizarea datelor pe paginile de Dashboard și Reports este realizată cu **Recharts**, o bibliotecă de grafice declarativă construită peste D3.js, special concepută pentru React. Recharts oferă o API compozițională, în care un grafic este definit prin componente React (`<BarChart>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`, `<Legend>`), parametrii fiind transmise prin props.

Avantajul față de alternative precum Chart.js (care lucrează direct cu canvas) sau D3.js pur (care necesită cunoștințe avansate de manipulare DOM) este faptul că Recharts se integrează natural cu modelul React, beneficiind de re-randările automate la modificarea datelor și de suportul nativ pentru responsive design prin componenta `<ResponsiveContainer>`.

În cadrul aplicației au fost utilizate următoarele tipuri de grafice:
- **BarChart vertical grouped** pentru activitatea lunară (total / aprobate / respinse pe ultimele 6 luni)
- **PieChart cu inner radius** pentru distribuția cererilor pe status
- **BarChart orizontal** pentru cereri grupate după scopul creditului
- **Progress bars custom** pentru distribuția pe nivel de risc

### I.1.5 React Router și gestionarea rutelor SPA

Navigarea între pagini este gestionată de **React Router** (versiunea 7), biblioteca standard de facto pentru routing în aplicații React. Spre deosebire de aplicațiile multi-pagină tradiționale, în care navigarea declanșează un request HTTP complet către server, React Router interceptează evenimentele de navigare în browser și actualizează componenta afișată fără a reîncărca pagina.

Aceasta este o caracteristică esențială a paradigmei Single Page Application, care oferă o tranziție rapidă între secțiunile aplicației și conservă starea internă (de exemplu, datele utilizatorului logat) între navigări.

Pentru protecția rutelor (care necesită autentificare sau roluri specifice) a fost implementat un pattern personalizat de **Higher-Order Component** numit `<ProtectedRoute>`, care verifică prezența unui token JWT valid și rolul utilizatorului înainte de a permite accesul la pagină. În caz contrar, utilizatorul este redirecționat automat către pagina de login. Detaliile concrete ale implementării vor fi prezentate în Capitolul III.

## I.2 Nivelul logic și comunicarea cu serverul

Nivelul logic al aplicației este responsabil pentru implementarea regulilor de business, validarea datelor, autentificarea utilizatorilor, accesul la baza de date și comunicarea cu serviciile externe. În arhitectura aleasă, acest nivel este izolat complet de interfața utilizator și expune funcționalitățile sale exclusiv printr-un API REST sigur și bine documentat.

### I.2.1 .NET 9 și ASP.NET Core Web API

**.NET** este o platformă de dezvoltare cross-platform, open-source, dezvoltată și menținută de Microsoft. Reprezintă o reimplementare modernă a platformei istorice .NET Framework, oferind suport pentru sisteme de operare Windows, Linux și macOS, precum și capacitatea de a rula în containere Docker.

Pentru CreditWise s-a utilizat **.NET versiunea 9**, cea mai recentă versiune stabilă disponibilă la momentul dezvoltării, care aduce îmbunătățiri semnificative la nivel de performanță (în special pentru operațiile asincrone), suport îmbunătățit pentru native AOT compilation și API-uri noi pentru manipularea JSON, configurației și logging-ului.

**ASP.NET Core** este framework-ul web inclus în .NET, utilizat pentru construcția de aplicații web și API-uri REST. Pentru CreditWise s-a optat pentru modelul **Controller-based** (Web API), în care fiecare grupare logică de endpoint-uri este reprezentată de o clasă Controller (de exemplu, `ClientsController`, `CreditRequestsController`, `ChatController`), iar metodele HTTP individuale sunt decorate cu atribute precum `[HttpGet]`, `[HttpPost]`, `[HttpPut]`. Această abordare oferă o structură familiară și ușor de urmărit, fiind preferată față de modelul Minimal API pentru proiecte cu număr crescut de endpoint-uri (29 în cazul aplicației de față).

Toate request-urile sunt procesate printr-un pipeline de middleware care include, în ordine: gestionarea globală a erorilor (ProblemDetails), redirecționarea HTTPS, CORS, rate limiting, autentificarea JWT, autorizarea bazată pe roluri și, în final, routarea către controller-ul corespunzător.

### I.2.2 Limbajul C# și Entity Framework Core

**C#** este un limbaj de programare orientat obiect, dezvoltat de Microsoft și standardizat de ECMA și ISO. Combină robustețea tipurilor statice cu productivitatea unor caracteristici moderne precum **LINQ** (Language Integrated Query), **async/await** pentru operații asincrone, **pattern matching** avansat, **records** (tipuri imutabile) și **nullable reference types** pentru detectarea statică a potențialelor NullReferenceException.

Versiunea 13 a limbajului C# (inclusă în .NET 9) a fost utilizată pentru întreaga implementare. Caracteristici specifice care s-au dovedit deosebit de utile includ:

- **Switch expressions** pentru logică condițională concisă (utilizate în `ScoringService` pentru calcularea scorului pe baza factorilor ponderați)
- **Init-only setters** pentru proprietăți care nu trebuie modificate după inițializare
- **Records** pentru DTO-uri imutabile utilizate la comunicarea cu API-ul Anthropic
- **Pattern matching** pentru maparea tipurilor de excepții la coduri HTTP corespunzătoare în middleware-ul global

**Entity Framework Core** (EF Core) este ORM-ul (Object-Relational Mapper) oficial al ecosistemului .NET. EF Core permite maparea claselor C# la tabele relaționale și permite scrierea de interogări LINQ care sunt traduse automat în SQL nativ optimizat pentru fiecare provider de bază de date (PostgreSQL, în cazul de față, prin `Npgsql.EntityFrameworkCore.PostgreSQL`).

Caracteristicile specifice utilizate în CreditWise includ:
- **Code-first migrations** — schema bazei de date este derivată din clasele C# și versiunile migrațiilor sunt stocate în repository alături de cod
- **Change tracking** automat — modificările făcute asupra entităților sunt detectate și persistate eficient
- **Eager loading** prin `.Include()` pentru încărcarea relațiilor navigaționale (de exemplu, încărcarea unei cereri de credit împreună cu clientul și decizia asociate într-o singură interogare)
- **AsNoTracking** pentru interogări read-only, care îmbunătățește performanța prin eliminarea overhead-ului de change tracking
- **Aggregate functions** native (`CountAsync`, `SumAsync`, `AverageAsync`, `GroupBy`) pentru calculele agregate efectuate direct în baza de date

### I.2.3 Arhitectura RESTful și Clean Architecture

API-ul backend respectă principiile arhitecturii **REST (Representational State Transfer)**, formulată de Roy Fielding în teza sa de doctorat din 2000. Caracteristicile REST utilizate includ:

- **Resurse identificate prin URI-uri stabile** (de exemplu, `/api/Clients/{id}`, `/api/CreditRequests/{id}/status`)
- **Metode HTTP semantice** — GET pentru citire, POST pentru creare, PUT/PATCH pentru actualizare, DELETE pentru ștergere
- **Coduri de status standard** — 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Server Error
- **Reprezentări în format JSON** pentru request și response bodies
- **Stateless** — fiecare request conține toate informațiile necesare pentru procesare (token-ul JWT include identitatea utilizatorului), serverul nu menține sesiuni

Pe lângă pattern-ul REST, arhitectura aplicației este structurată conform principiilor **Clean Architecture**, propuse de Robert C. Martin în cartea sa omonimă din 2017. Această arhitectură împarte codul în patru straturi concentrice, cu dependențe strict orientate spre interior:

1. **Domain** — entitățile de business pure (User, Client, CreditRequest, Decision, UserPreference) și interfețele repository-urilor
2. **Application** — logica de business, servicii, DTO-uri, validare, configurări
3. **Infrastructure** — implementări concrete de I/O (Entity Framework, SMTP, Anthropic HTTP client)
4. **API** (Presentation) — controllers, middleware, configurare DI

Beneficiul principal al acestei arhitecturi este **inversiunea dependențelor**: straturile interioare (Domain, Application) nu cunosc nimic despre cele exterioare (Infrastructure, API), ceea ce permite testarea izolată a logicii de business și facilitează înlocuirea unor componente externe (de exemplu, schimbarea bazei de date de la PostgreSQL la SQL Server) cu impact minim asupra logicii de business.

### I.2.4 Autentificare cu JWT și SecurityStamp

Autentificarea utilizatorilor este realizată prin **JSON Web Tokens (JWT)**, un standard descris în **RFC 7519**, care definește o structură compactă și sigură pentru transmiterea de informații semnate digital între părți. Un JWT este format din trei părți codificate Base64URL și separate prin punct: header (algoritmul de semnare), payload (claim-urile efective) și signature (semnătura HMAC SHA-256).

În contextul CreditWise, JWT-ul conține următoarele claim-uri:
- `sub` (subject) — identificatorul GUID al utilizatorului
- `email` — adresa de email
- `role` — rolul utilizatorului (Admin, Analyst sau Banker)
- `name` — numele complet
- `security_stamp` — un GUID regenerat la fiecare schimbare critică
- `exp` — timestamp-ul de expirare (7 zile de la emitere)

Spre deosebire de modelul tradițional de sesiuni stocate server-side, JWT-urile sunt **stateless**: serverul nu menține nicio informație despre sesiuni active, validarea token-ului fiind realizată exclusiv prin verificarea semnăturii cu cheia secretă cunoscută doar de server. Această abordare oferă scalabilitate ridicată (orice instanță a serverului poate valida token-ul) și simplifică arhitectura.

Dezavantajul clasic al JWT-urilor este **dificultatea invalidării unui token înainte de expirare** (de exemplu, când un utilizator își schimbă parola sau este dezactivat). Pentru a rezolva această problemă, în CreditWise a fost implementat un mecanism inspirat din ASP.NET Identity, denumit **SecurityStamp**: fiecare utilizator are în baza de date un GUID asociat (`SecurityStamp`), care este inclus în JWT la momentul emiterii. La fiecare request autenticat, un middleware verifică dacă valoarea din token corespunde celei curente din baza de date — în caz de discrepanță, token-ul este invalidat instant.

`SecurityStamp` este regenerat în trei scenarii critice:
- la schimbarea parolei
- la resetarea parolei prin email
- la dezactivarea contului de către administrator

Această soluție combină avantajele JWT-urilor (statelessness, performanță) cu posibilitatea de invalidare imediată specifică sesiunilor server-side.

## I.3 Nivelul de date

Nivelul de date este responsabil pentru stocarea persistentă a tuturor informațiilor manipulate de aplicație: utilizatori, clienți, cereri de credit, decizii, tranzacții și preferințe. Alegerea unui sistem de gestiune a bazelor de date relaționale (RDBMS) a fost motivată de natura puternic structurată a domeniului bancar și de nevoia de a garanta integritatea referențială între entități.

### I.3.1 PostgreSQL

**PostgreSQL** este un sistem de gestiune a bazelor de date relaționale open-source, dezvoltat continuu din 1996, recunoscut în industrie pentru robustețea sa, conformitatea strictă cu standardul SQL și suportul avansat pentru caracteristici complexe. La momentul redactării, PostgreSQL este utilizat de companii precum Apple, Spotify, Instagram, Reddit, fiind frecvent considerat unul dintre cele mai mature și performante RDBMS-uri open-source.

Pentru CreditWise s-a ales PostgreSQL în detrimentul altor alternative (MySQL, SQL Server, SQLite) din următoarele motive:
- **Suport nativ pentru UUID** — întregul model de date utilizează UUID-uri ca cheie primară, pentru a permite generarea lor client-side fără dependență de un secvențiator server-side
- **Funcția `gen_random_uuid()`** disponibilă nativ începând cu PostgreSQL 13, utilizată în migrațiile pentru popularea coloanelor noi cu valori unice
- **Suport pentru `ILIKE`** (case-insensitive `LIKE`) pentru implementarea căutării textuale eficiente
- **Performanță superioară** pe query-uri complexe cu agregate și GROUP BY
- **Disponibilitate gratuită** în mediile de producție prin servicii cloud precum Supabase

Schema bazei de date este compusă din cinci tabele principale (Users, Clients, CreditRequests, Decisions, UserPreferences), cu relații implementate prin chei externe (foreign keys) cu comportamente explicit configurate la ștergere (`Restrict`, `SetNull`, `Cascade`) — detaliate în Capitolul III.

### I.3.2 Supabase — Postgres hosted în cloud

Pentru mediul de producție al aplicației s-a optat pentru utilizarea serviciului **Supabase**, o platformă open-source de tip Backend-as-a-Service care oferă, printre alte servicii, hosting gratuit pentru baze de date PostgreSQL. Supabase utilizează PostgreSQL nativ (nu un fork sau o variantă proprie), ceea ce garantează compatibilitatea totală cu codul scris pentru un PostgreSQL standard.

Caracteristicile principale care au motivat alegerea Supabase pentru CreditWise:
- **Free tier generos**: 500 MB de storage, 2 GB de transfer lunar, până la 50.000 utilizatori autentificați activi lunar
- **Connection pooler integrat** prin PgBouncer, esențial pentru aplicații hosted pe platforme cu instanțe efemere (Render)
- **Backup automat zilnic** și posibilitatea de restore point-in-time
- **Acces la consola SQL prin browser**, util pentru debugging și inspecția datelor
- **Suport nativ pentru SSL/TLS**, obligatoriu pentru transmiterea sigură a credențialelor și a datelor sensibile

Pentru conexiunea aplicației la Supabase a fost utilizat **Session pooler-ul** (port 5432), preferat în detrimentul conexiunii directe sau a Transaction pooler-ului, deoarece Session pooler-ul păstrează suportul pentru *prepared statements* — necesar pentru Entity Framework Core. Stringul de conexiune este stocat exclusiv în variabile de mediu sau în .NET User Secrets, fiind exclus categoric din repository-ul Git.

### I.3.3 Migrații Entity Framework Core

Schema bazei de date este versionată și controlată prin **migrații Entity Framework Core**, un mecanism prin care fiecare modificare a modelului de date (adăugare de tabel, coloană, index, foreign key etc.) este materializată într-o pereche de fișiere C# (`.cs` și `.Designer.cs`) care descriu, în formă programatică, atât pașii necesari pentru aplicarea migrației (`Up`), cât și pașii pentru anularea ei (`Down`).

Această abordare prezintă multiple avantaje:
- **Schema este reproductibilă** — orice mediu (local, staging, producție) poate fi adus la versiunea curentă a schemei rulând secvența completă de migrații
- **Istoricul evoluției schemei** este vizibil în repository și navigabil împreună cu istoria codului sursă
- **Aplicarea automată la startup**: în aplicația CreditWise, fiecare pornire a backend-ului verifică și aplică automat migrațiile noi prin `db.Database.Migrate()`, ceea ce elimină pașii manuali de deploy și asigură că schema este mereu sincronizată cu codul

Pe parcursul dezvoltării au fost create **9 migrații** distincte, fiecare cu un nume descriptiv (de exemplu, `InitialCreate`, `AddUserProfileFields`, `AddUserSecurityStamp`, `ConfigureUserForeignKeys`, `AddUserPreferences`, `DropDocumentsTable`), care reflectă evoluția incrementală a modelului de date.

## I.4 Integrări externe

Pe lângă tehnologiile fundamentale care formează stack-ul aplicației, CreditWise integrează două servicii externe pentru funcționalități specializate care nu ar putea fi implementate cu costuri rezonabile in-house: un model de limbaj pentru asistentul AI și un serviciu de email tranzacțional pentru notificări.

### I.4.1 Anthropic Claude API cu Tool Use

**Anthropic** este o companie americană fondată în 2021 de foști cercetători OpenAI, specializată în dezvoltarea de modele de limbaj de mari dimensiuni (Large Language Models — LLMs) cu accent pe siguranță și control. Familia de modele **Claude** dezvoltată de Anthropic include mai multe variante de capacitate și cost, dintre care pentru CreditWise s-a ales **Claude Sonnet 4.6**, un model de capacitate medie-superioară, cu un raport optim între cost și calitate pentru aplicații conversaționale cu volum moderat de utilizatori.

Caracteristica cheie care a determinat alegerea acestui API este suportul nativ pentru paradigma **Tool Use** (cunoscută și sub denumirea de "function calling" la alți furnizori). Tool Use permite expunerea către model a unui set de funcții predefinite, descrise prin JSON Schema, pe care modelul le poate apela în mod autonom pentru a obține informații concrete din sistemul propriu. Această abordare reprezintă o evoluție semnificativă față de chatbot-urile clasice, care răspund exclusiv pe baza cunoștințelor încorporate în modelul de bază, fără capacitatea de a accesa date proprii ale unei organizații.

În cazul CreditWise, asistentul AI are acces la **șapte tools** read-only:
- `get_client` — preluarea profilului unui client
- `list_clients` — listă paginată cu opțiuni de căutare
- `get_credit_request` — detalii cerere de credit
- `list_credit_requests` — listă paginată
- `get_dashboard_stats` — statistici agregate
- `get_decision` — decizia luată pe o cerere
- `list_transactions` — credite disbursate

Toolurile sunt filtrate **per rol al utilizatorului** — bancherii nu primesc în setul lor de tools `get_decision` și `list_transactions`, întrucât aceste funcții ar expune informații dincolo de permisiunile acordate prin REST API. Această filtrare se realizează la nivelul ChatService, înainte de a transmite cererea către Anthropic, garantând că modelul nu poate "vedea" tools la care nu are dreptul.

Integrarea cu API-ul Anthropic se face prin **HttpClient nativ .NET** (fără bibliotecă third-party), cu suport pentru **prompt caching** — o caracteristică prin care prompt-ul de sistem și definițiile tools (combinat aproximativ 1500 de tokens) sunt cached la nivelul Anthropic pentru cinci minute, reducând costul tokenelor de intrare cu **70–90%** pe turnurile ulterioare ale aceleiași conversații.

Detaliile arhitecturale și exemple concrete de utilizare vor fi prezentate în secțiunea III.5.

### I.4.2 Resend — serviciu de email tranzacțional

Pentru trimiterea de email-uri tranzacționale (resetare parolă, notificare decizie, anunț cerere nouă pentru analiști), aplicația utilizează **Resend**, un serviciu modern de email API lansat în 2023, gândit special pentru dezvoltatori. Resend oferă două modalități de utilizare: prin **SMTP relay** (compatibil cu orice client SMTP, inclusiv MailKit folosit în .NET) și prin **HTTPS REST API** la endpoint-ul `api.resend.com/emails`.

Alegerea Resend a fost motivată de:
- **Free tier ofertant** — 3000 emails/lună și 100 emails/zi, suficient pentru un proiect academic cu volume reduse
- **DX (Developer Experience) modern** — UI curat pentru monitorizarea email-urilor trimise, statistici detaliate, log-uri în timp real
- **Verificare facilă a domeniilor** prin DNS pentru utilizare în producție reală
- **Posibilitatea de a testa cu adresa sender `onboarding@resend.dev`** fără verificare de domeniu (cu limitarea că receptorul trebuie să fie adresa proprietarului contului Resend)

În timpul deployment-ului în producție pe Render a fost descoperită o limitare importantă: **platforma Render blochează conexiunile outbound pe porturile SMTP standard (25, 465, 587)** pentru a preveni utilizarea instanțelor gratuite pentru spam. Această descoperire a impus refactorizarea componentei de email pentru a suporta **două implementări alternative** ale interfeței `IEmailService`:

- `SmtpEmailService` — implementare bazată pe MailKit cu conexiune SMTP, utilizată pentru dezvoltare locală cu MailHog
- `ResendEmailService` — implementare bazată pe HTTPS REST către `api.resend.com/emails`, utilizată în producție pe Render

Selecția între cele două implementări se face condițional, prin flag-ul de configurare `Email:UseResendApi`, citit la nivelul containerului de DI. Această soluție elegantă demonstrează beneficiile arhitecturii Clean — cu o interfață stabilă și două implementări izolate, aplicația poate adapta transportul de email la constrângerile fiecărui mediu fără modificări în logica de business.

---

În acest capitol au fost prezentate principalele tehnologii utilizate în dezvoltarea aplicației CreditWise, grupate pe niveluri arhitecturale. În capitolul următor va fi abordat modul de implementare al aplicației, cu accent pe deciziile arhitecturale, modelarea bazei de date și definirea fluxurilor logice între componente.
