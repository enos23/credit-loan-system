# UNIVERSITATEA DIN ORADEA

## FACULTATEA DE INFORMATICĂ ȘI ȘTIINȚE

### PROGRAMUL DE STUDII: INFORMATICĂ

---

# LUCRARE DE LICENȚĂ

## CreditWise — Aplicație Web pentru Gestionarea Cererilor de Credit Bancar cu Asistent AI Integrat

---

**Coordonator științific:**
[Numele coordonatorului]

**Absolvent:**
[Numele absolventului]

---

**Oradea, 2026**

\newpage

---

# CUPRINS

**INTRODUCERE** ............................................................................. 3
- Prezentarea temei
- Motivul alegerii temei
- Scopul și obiectivele lucrării

**CAPITOLUL I — TEHNOLOGII FOLOSITE** ............................................. 6
- I.1 Nivelul de prezentare al interfeței aplicației
  - I.1.1 React 19 cu JSX
  - I.1.2 Vite — build tool modern
  - I.1.3 Tailwind CSS și shadcn/ui
  - I.1.4 Recharts pentru vizualizarea datelor
  - I.1.5 React Router și gestionarea rutelor SPA
- I.2 Nivelul logic și comunicarea cu serverul
  - I.2.1 .NET 9 și ASP.NET Core Web API
  - I.2.2 Limbajul C# și Entity Framework Core
  - I.2.3 Arhitectura RESTful și Clean Architecture
  - I.2.4 Autentificare cu JWT și SecurityStamp
- I.3 Nivelul de date
  - I.3.1 PostgreSQL
  - I.3.2 Supabase — Postgres hosted în cloud
  - I.3.3 Migrații Entity Framework Core
- I.4 Integrări externe
  - I.4.1 Anthropic Claude API cu Tool Use
  - I.4.2 Resend — serviciu de email tranzacțional

**CAPITOLUL II — MODUL DE IMPLEMENTARE A APLICAȚIEI** ................... 22
- II.1 Planificarea procesului de dezvoltare
- II.2 Analiza cerințelor funcționale și nefuncționale
- II.3 Proiectarea arhitecturii Clean Architecture
- II.4 Modelarea bazei de date (schema ER)
- II.5 Actorii sistemului și rolurile (diagrama use case)
- II.6 Definirea fluxurilor logice (diagrama de secvență)
- II.7 Sistemul de evaluare a riscului (scoring ponderat)
- II.8 Strategii de scalabilitate
- II.9 Decizii de securitate la nivel de design

**CAPITOLUL III — IMPLEMENTAREA APLICAȚIEI** ................................. 38
- III.1 Structura bazei de date
- III.2 Structura Backend (.NET 9, patru layere)
- III.3 Structura Frontend (React + Vite)
- III.4 Funcționalitățile aplicației
- III.5 Asistentul conversațional AI
- III.6 Sistemul de notificări prin email
- III.7 Securitatea aplicației
- III.8 Containerizarea și deployment-ul
- III.9 Testarea aplicației

**CONCLUZII ȘI PROPUNERI DE DEZVOLTARE** ................................... 67
- Concluzii generale
- Realizările principale
- Limitări identificate
- Propuneri de dezvoltare viitoare
- Concluzii finale

**BIBLIOGRAFIE** ............................................................................. 77

\newpage

# INTRODUCERE

## Prezentarea temei

Activitatea de creditare bancară reprezintă unul dintre pilonii fundamentali ai sistemului financiar modern. În contextul digitalizării accelerate a serviciilor financiare, instituțiile bancare se confruntă cu nevoia continuă de a-și moderniza procesele interne, în special cele legate de gestionarea cererilor de credit și de evaluarea riscului asociat fiecărui solicitant. Procesul tradițional, care implică analiză manuală a documentelor, calcul subiectiv al riscului și comunicare ad-hoc cu clienții, este consumator de timp, predispus la erori umane și dificil de scalat la volume mari de tranzacții.

Lucrarea de față abordează această problematică prin proiectarea și dezvoltarea unei aplicații web complete, denumite **CreditWise**, destinată gestionării unitare a întregului flux al procesului de creditare. Aplicația acoperă toate etapele relevante — de la înregistrarea clientului în sistem, la procesarea cererii de credit, evaluarea automatizată a riscului, asistarea analistului în luarea deciziei finale, până la urmărirea creditelor disbursate și generarea de rapoarte agregate pentru management.

CreditWise se distinge prin integrarea unui asistent conversațional bazat pe inteligență artificială, dezvoltat utilizând API-ul **Anthropic Claude Sonnet 4.6** cu paradigma **Tool Use**. Această abordare permite utilizatorilor interni — administratori, analiști sau bancheri — să interogheze datele aplicației în limbaj natural, asistentul fiind capabil să apeleze funcții predefinite asupra sistemului propriu pentru a oferi răspunsuri concrete, bazate pe date reale, fără riscul de a inventa informații.

Din punct de vedere tehnic, aplicația este structurată pe arhitectura **Clean Architecture**, propusă de Robert C. Martin, ceea ce asigură o separare strictă a responsabilităților între cele patru niveluri (Domain, Application, Infrastructure și Presentation) și permite o evoluție flexibilă a sistemului. Componentele aplicației sunt containerizate prin Docker și implementate într-un mediu de producție distribuit, utilizând Vercel pentru interfața utilizator, Render pentru API-ul backend și Supabase pentru baza de date relațională.

## Motivul alegerii temei

Alegerea acestei teme a fost determinată de convergența a trei factori principali: interesul personal pentru sectorul **fintech**, dorința de a aprofunda tehnologii moderne aflate în continuă evoluție și provocarea de a integra inteligența artificială într-un context business real, dincolo de demonstrații izolate.

În primul rând, domeniul tehnologiei financiare a cunoscut o creștere accentuată în ultimul deceniu, devenind unul dintre cele mai dinamice sectoare ale industriei IT. Aplicațiile financiare combină rigoare matematică, cerințe stricte de securitate, fluxuri de business complexe și interacțiune cu utilizatori cu profil divers — un set de constrângeri care face din acest domeniu un mediu de învățare ideal pentru un dezvoltator software. Posibilitatea de a construi un sistem care imită modul de operare al unei instituții bancare reale a reprezentat o oportunitate de a învăța nu doar tehnologii, ci și **modul în care problemele de business se traduc în decizii arhitecturale**.

În al doilea rând, alegerea stack-ului tehnologic — .NET 9, ASP.NET Core Web API, React 19, PostgreSQL — reflectă o orientare conștientă către tehnologii mature, larg adoptate în industrie și cu un ecosistem extins de biblioteci suport. Pe parcursul dezvoltării au fost integrate și instrumente moderne precum Vite, Tailwind CSS și shadcn/ui pentru interfața utilizator, Entity Framework Core pentru maparea obiect-relațională, Microsoft.AspNetCore.RateLimiting pentru protecția împotriva abuzurilor și MailKit pentru integrarea cu sisteme de email. Această diversitate tehnologică a oferit ocazia de a aprofunda atât conceptele arhitecturale (separarea preocupărilor, dependency inversion, design pattern-uri), cât și aspectele practice ale dezvoltării unei aplicații production-grade (containerizare, deployment cloud, configurare prin variabile de mediu, managementul secretelor).

În al treilea rând, integrarea unui asistent AI bazat pe Tool Use reprezintă o explorare a unei paradigme relativ recente în domeniul inteligenței artificiale aplicate. Spre deosebire de chatbot-urile clasice, care răspund pe baza unui model lingvistic generic, paradigma Tool Use permite modelului să apeleze funcții reale din aplicație, garantând astfel acuratețea răspunsurilor și evitând fenomenul de "halucinare". Această abordare deschide perspective noi pentru asistenți inteligenți care interacționează cu date proprii ale unei organizații, păstrând în același timp un control riguros asupra ce poate sau nu poate accesa modelul.

## Scopul și obiectivele lucrării

**Scopul principal** al lucrării este proiectarea, implementarea și deployment-ul unei aplicații web complete de gestionare a creditelor bancare, care să demonstreze aplicarea practică a principiilor moderne de dezvoltare software într-un context business realist. Aplicația rezultată trebuie să fie funcțională end-to-end, accesibilă public prin internet și suficient de robustă pentru a putea fi prezentată în cadrul unui demo live.

Pentru atingerea scopului propus, au fost definite următoarele **obiective specifice**:

1. **Modelarea domeniului** — identificarea entităților principale (utilizatori interni, clienți, cereri de credit, decizii, tranzacții, preferințe) și a relațiilor dintre acestea, urmată de proiectarea schemei relaționale a bazei de date cu respectarea principiilor de normalizare și integritate referențială.

2. **Implementarea unui sistem complet CRUD** pentru entitățile principale, cu suport pentru paginare, căutare și filtrare server-side, capabil să gestioneze eficient volume crescânde de date.

3. **Dezvoltarea unui sistem automatizat de scoring** pentru evaluarea riscului de credit, bazat pe un model ponderat cu patru factori (raport datorii/venituri, stabilitatea angajării, raport sumă solicitată/venit anual, vârsta solicitantului), care să asiste analistul în procesul decizional fără a-l înlocui.

4. **Implementarea autentificării și autorizării** pe baza JSON Web Tokens, cu mecanisme avansate de invalidare a sesiunilor (SecurityStamp), protecție împotriva atacurilor de tip brute-force prin rate limiting, validare strictă a parolelor și separare rolică între cei trei actori ai sistemului (Administrator, Analist, Bancher).

5. **Integrarea unui asistent conversațional AI** utilizând Anthropic Claude API cu Tool Use, expunând model-ului un set de funcții read-only filtrate per rol, astfel încât asistentul să răspundă la întrebări în limbaj natural pe baza datelor reale din sistem, respectând politicile de autorizare existente.

6. **Implementarea unui sistem de notificări prin email**, cu template-uri HTML profesionale și fallback plain-text, integrat cu MailHog pentru dezvoltare locală și cu Resend pentru producție, capabil să anunțe automat clientul la finalizarea unei decizii și analiștii la apariția unei cereri noi.

7. **Dezvoltarea unei interfețe utilizator moderne și responsive**, cu suport pentru ecrane mobile, tablete și desktop, utilizând React 19, Tailwind CSS și componente reutilizabile din ecosistemul shadcn/ui.

8. **Containerizarea aplicației** prin Docker și orchestrarea local-ului prin docker-compose, urmată de deployment în mediu de producție pe platforme cloud (Vercel pentru frontend, Render pentru backend, Supabase pentru baza de date), demonstrând astfel întregul ciclu de viață al unei aplicații moderne — de la dezvoltare locală până la rulare în cloud.

9. **Asigurarea unui nivel adecvat de securitate** prin implementarea de bune practici industriale: hashing al parolelor cu BCrypt, restricții CORS configurabile, gestionarea secretelor prin variabile de mediu (zero credențiale în repository), validare la limita sistemului prin Data Annotations și middleware global de gestionare a erorilor.

10. **Documentarea exhaustivă a proiectului** prin diagrame UML (use case, secvență, ER), arhitecturală (Clean Architecture), README detaliat pentru dezvoltatori și o colecție Postman care servește ca documentație live a API-ului.

Aceste obiective acoperă întreaga gamă de competențe relevante pentru dezvoltarea unei aplicații full-stack moderne și constituie cadrul în care lucrarea va fi structurată în capitolele următoare.

\newpage

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

\newpage

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

\newpage

# CAPITOLUL III — IMPLEMENTAREA APLICAȚIEI

Acest capitol prezintă în detaliu modul concret de implementare al aplicației CreditWise, cu fragmente de cod relevante, descrierea structurii fizice a proiectului și ilustrarea principalelor fluxuri de utilizare prin capturi de ecran. Spre deosebire de capitolele anterioare, care s-au concentrat pe tehnologii și decizii arhitecturale, acest capitol pătrunde în detaliile codului efectiv scris, oferind o perspectivă completă asupra realizării practice a sistemului.

## III.1 Structura bazei de date

Schema bazei de date a aplicației este construită din cinci tabele principale, descrise în detaliu mai jos. Toate tabelele utilizează coloana `Id` de tip `uuid` ca cheie primară, generată client-side prin `Guid.NewGuid()` în C#. Această alegere oferă mai multe avantaje: posibilitatea de a genera cheile fără round-trip către baza de date, eliminarea conflictelor în cazul replicării și o mai bună distribuție pentru indecșii de tip B-tree.

### III.1.1 Tabela Users

Tabela `Users` stochează utilizatorii interni ai sistemului. Structura completă, derivată din clasa `User.cs` din Domain Layer, este următoarea:

```sql
CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(100) NOT NULL,
    "PasswordHash" text NOT NULL,
    "FirstName" character varying(50) NOT NULL,
    "LastName" character varying(50) NOT NULL,
    "Role" integer NOT NULL,
    "Phone" text NULL,
    "Bio" text NULL,
    "AvatarGradient" text NULL,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "CreatedAt" timestamp with time zone NOT NULL,
    "ResetPasswordToken" text NULL,
    "ResetPasswordTokenExpiry" timestamp with time zone NULL,
    "SecurityStamp" uuid NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
```

Pentru coloana `Email` este definit un **index unic**, care servește două scopuri: garantarea că nu pot exista doi utilizatori cu aceeași adresă de email și accelerarea căutărilor după email (frecvente, în cadrul flow-ului de login).

Coloana `Role` este de tip `integer` și mapează valorile enum-ului `UserRole` din Domain Layer: 0 pentru Admin, 1 pentru Analyst, 2 pentru Banker. Această reprezentare numerică este preferată față de un tip enum nativ PostgreSQL pentru flexibilitatea de a adăuga noi roluri în viitor fără migrații DDL complexe.

`SecurityStamp` este coloana cheie a mecanismului de invalidare a JWT-urilor. Este populată inițial cu `gen_random_uuid()` pentru rândurile existente (prin migrația `AddUserSecurityStamp`) și este regenerată ulterior la fiecare modificare critică (schimbare parolă, schimbare rol, dezactivare cont).

### III.1.2 Tabela Clients

Tabela `Clients` reține informațiile despre solicitanții de credit:

```sql
CREATE TABLE "Clients" (
    "Id" uuid NOT NULL,
    "CNP" character varying(13) NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text NOT NULL,
    "DateOfBirth" timestamp with time zone NOT NULL,
    "Address" text NOT NULL,
    "EmploymentStatus" integer NOT NULL,
    "MonthlyIncome" numeric(18,2) NOT NULL,
    "MonthlyExpenses" numeric(18,2) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Clients" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_Clients_CNP" ON "Clients" ("CNP");
```

Coloana `CNP` este restricționată la 13 caractere (lungimea standard a Codului Numeric Personal românesc) și are un index unic. Tipul `numeric(18,2)` pentru sume monetare oferă precizia exactă necesară pentru calcule financiare, evitând erorile de rotunjire ale tipurilor floating-point.

### III.1.3 Tabela CreditRequests

Reprezintă entitatea centrală a aplicației, conectând clienții cu deciziile analiștilor:

```sql
CREATE TABLE "CreditRequests" (
    "Id" uuid NOT NULL,
    "ClientId" uuid NOT NULL,
    "AssignedAnalystId" uuid NULL,
    "Amount" numeric(18,2) NOT NULL,
    "TermMonths" integer NOT NULL,
    "Purpose" text NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "CreditScore" integer NOT NULL,
    "RiskLevel" integer NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_CreditRequests" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CreditRequests_Clients_ClientId"
        FOREIGN KEY ("ClientId") REFERENCES "Clients" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_CreditRequests_Users_AssignedAnalystId"
        FOREIGN KEY ("AssignedAnalystId") REFERENCES "Users" ("Id") ON DELETE SET NULL
);
```

Două constraints de cheie externă cu comportamente diferite:
- `ClientId` are `ON DELETE RESTRICT` — un client nu poate fi șters din sistem cât timp are cereri asociate
- `AssignedAnalystId` are `ON DELETE SET NULL` — un analist poate fi dezactivat sau (teoretic) șters, iar cererile asignate lui devin "neasignate" în loc să fie pierdute

### III.1.4 Tabela Decisions

Stochează deciziile analiștilor, într-o relație unu-la-unu cu cererile:

```sql
CREATE TABLE "Decisions" (
    "Id" uuid NOT NULL,
    "CreditRequestId" uuid NOT NULL,
    "AnalystId" uuid NOT NULL,
    "DecisionType" integer NOT NULL,
    "InterestRate" numeric(5,2) NULL,
    "ApprovedAmount" numeric(18,2) NULL,
    "Notes" text NOT NULL DEFAULT '',
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Decisions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Decisions_CreditRequests_CreditRequestId"
        FOREIGN KEY ("CreditRequestId") REFERENCES "CreditRequests" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Decisions_Users_AnalystId"
        FOREIGN KEY ("AnalystId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "IX_Decisions_CreditRequestId" ON "Decisions" ("CreditRequestId");
```

Indexul unic pe `CreditRequestId` materializează relația 1:1 — fiecare cerere are cel mult o decizie. Tentativa de a insera o a doua decizie pentru aceeași cerere produce o eroare de duplicate key, care este interceptată de logica de business și transformată într-un răspuns HTTP `409 Conflict` cu mesaj sugestiv.

Constraint-ul `ON DELETE RESTRICT` pe `AnalystId` reflectă cerința de **audit trail**: deciziile rămân atribuite analistului care le-a luat, indiferent de starea ulterioară a contului acestuia.

### III.1.5 Tabela UserPreferences

Stochează preferințele individuale ale utilizatorilor:

```sql
CREATE TABLE "UserPreferences" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "NotifyEmailNewRequest" boolean NOT NULL,
    "NotifyEmailDecision" boolean NOT NULL,
    "NotifyBrowserAlerts" boolean NOT NULL,
    "NotifyWeeklyReport" boolean NOT NULL,
    "Language" character varying(8) NOT NULL,
    "DateFormat" character varying(20) NOT NULL,
    "ItemsPerPage" integer NOT NULL,
    "Theme" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_UserPreferences" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_UserPreferences_Users_UserId"
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_UserPreferences_UserId" ON "UserPreferences" ("UserId");
```

Comportamentul `ON DELETE CASCADE` pe `UserId` reflectă natura intrinsecă a preferințelor: ele nu au sens fără utilizatorul căruia îi aparțin, deci dispar automat odată cu acesta. Indexul unic pe `UserId` materializează relația 1:1.

### III.1.6 Versionarea schemei

Schema descrisă mai sus este rezultatul unei evoluții incrementale, materializată în **nouă migrații Entity Framework Core**, fiecare cu un nume descriptiv:

```
20260406114354_InitialCreate
20260505074444_AddUserProfileFields
20260513100000_AddUserIsActive
20260515120000_AddUserResetPasswordFields
20260523062410_AddUserSecurityStamp
20260523163027_DropDocumentsTable
20260530123844_ConfigureUserForeignKeys
20260603133913_AddUserPreferences
```

Fiecare migrație este conținută în două fișiere C# (`.cs` cu operațiile Up/Down și `.Designer.cs` cu snapshot-ul modelului), versionate alături de codul sursă. La pornirea aplicației, metoda `db.Database.Migrate()` din `Program.cs` aplică automat toate migrațiile noi, asigurând că schema este mereu sincronizată cu codul. Această abordare elimină pașii manuali de deployment și permite configurarea identică a oricărui mediu (local, staging, producție) printr-o singură comandă.

## III.2 Structura Backend (.NET 9, patru layere)

Backend-ul aplicației este structurat fizic în patru proiecte .NET distincte, corespunzătoare celor patru layere Clean Architecture. Soluția (`CreditApp.sln`) le grupează împreună, iar dependențele inter-proiect sunt configurate explicit pentru a respecta regula direcției dependențelor.

### III.2.1 Domain Layer (`CreditApp.Domain`)

Conține nucleul pur al domeniului, fără dependențe externe. Structura fizică:

```
CreditApp.Domain/
├── Entities/
│   ├── User.cs
│   ├── Client.cs
│   ├── CreditRequest.cs
│   ├── Decision.cs
│   └── UserPreference.cs
├── Enums/
│   ├── UserRole.cs
│   ├── CreditStatus.cs
│   ├── RiskLevel.cs
│   ├── DecisionType.cs
│   └── EmploymentStatus.cs
└── Interfaces/
    ├── IUserRepository.cs
    ├── IClientRepository.cs
    ├── ICreditRequestRepository.cs
    ├── IDecisionRepository.cs
    └── IUserPreferenceRepository.cs
```

Un exemplu reprezentativ pentru o entitate este `User.cs`, care expune simultan proprietățile de business și navigation properties pentru Entity Framework Core, fără a depinde de pachetul EF în sine:

```csharp
namespace CreditApp.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Phone { get; set; }
    public string? Bio { get; set; }
    public string? AvatarGradient { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ResetPasswordToken { get; set; }
    public DateTime? ResetPasswordTokenExpiry { get; set; }
    public Guid SecurityStamp { get; set; } = Guid.NewGuid();
}
```

Interfețele repository-urilor declară contractul de acces la persistență, dar nu impun cum este implementat acel acces. Această separare permite Application Layer să consume aceste interfețe fără a ști dacă datele vin din Entity Framework, dintr-o bază NoSQL sau dintr-un sistem de fișiere.

### III.2.2 Application Layer (`CreditApp.Application`)

Conține întreaga logică de business, organizată pe arii funcționale:

```
CreditApp.Application/
├── Chat/                    # Sistemul de chatbot AI
│   ├── ChatService.cs
│   ├── SystemPrompt.cs
│   ├── Models/              # DTO-uri Anthropic (Message, ContentBlock, Tool)
│   ├── Tools/               # Cele 7 tools read-only
│   └── Dtos/                # Request/Response pentru endpoint-ul propriu
├── Configuration/           # POCO-uri pentru IOptions<T>
│   ├── JwtSettings.cs
│   ├── EmailSettings.cs
│   ├── AnthropicSettings.cs
├── DTOs/                    # Per resursă
│   ├── Auth/, Client/, CreditRequest/, Decision/, Users/, Dashboard/, Reports/, Transactions/
├── Email/                   # Templates + interface IEmailService
├── Exceptions/              # NotFoundException, ConflictException
├── Interfaces/Queries/      # IDashboardQueries, IReportsQueries
├── Pagination/              # PageRequest, PagedResult<T>
├── Services/                # Servicii de business
│   ├── AuthService.cs
│   ├── ClientService.cs
│   ├── CreditRequestService.cs
│   ├── DecisionService.cs
│   ├── DashboardService.cs
│   ├── ReportsService.cs
│   ├── TransactionService.cs
│   ├── UserManagementService.cs
│   ├── UserPreferenceService.cs
│   └── ScoringService.cs
├── Validation/              # PasswordValidator
└── DependencyInjection.cs   # Înregistrarea serviciilor în DI
```

Serviciile sunt elementul central al acestui layer. Fiecare serviciu primește prin injecție repository-urile și alte servicii necesare, expune metode publice către controllere și implementează logica de business specifică ariei sale. De exemplu, `DecisionService.CreateAsync` validează existența cererii, verifică inexistența unei decizii deja luate, parsează tipul deciziei, persistă datele și declanșează notificarea email a clientului — totul printr-un singur apel de la controller:

```csharp
public async Task<DecisionDto> CreateAsync(CreateDecisionDto dto, Guid analystId)
{
    var creditRequest = await _creditRequestRepository.GetByIdAsync(dto.CreditRequestId);
    if (creditRequest == null)
        throw new NotFoundException("Cererea de credit nu a fost găsită.");

    var existingDecision = await _decisionRepository.GetByCreditRequestIdAsync(dto.CreditRequestId);
    if (existingDecision != null)
        throw new ConflictException("Există deja o decizie pentru această cerere de credit.");

    if (!Enum.TryParse<DecisionType>(dto.DecisionType, out var decisionType))
        throw new InvalidOperationException($"Tipul de decizie '{dto.DecisionType}' nu este valid.");

    var decision = new Decision { /* ... */ };
    await _decisionRepository.AddAsync(decision);
    /* update status cerere + trimite email client */

    return MapToDto(decision);
}
```

Cele trei tipuri de excepții aruncate (`NotFoundException`, `ConflictException`, `InvalidOperationException`) sunt interceptate de middleware-ul global `GlobalExceptionHandler` și transformate în răspunsuri HTTP corespunzătoare (404, 409, 400).

### III.2.3 Infrastructure Layer (`CreditApp.Infrastructure`)

Conține toate implementările concrete care depind de tehnologii sau servicii externe:

```
CreditApp.Infrastructure/
├── Anthropic/
│   └── AnthropicClient.cs       # HttpClient pentru API-ul Anthropic
├── Data/
│   ├── AppDbContext.cs           # EF Core context
│   └── AppDbContextFactory.cs    # Factory pentru migrații EF design-time
├── Email/
│   ├── SmtpEmailService.cs       # Implementare via MailKit (MailHog dev)
│   └── ResendEmailService.cs     # Implementare via HTTPS REST (Resend prod)
├── Migrations/                   # 9 migrații Entity Framework
├── Queries/
│   ├── DashboardQueries.cs       # Implementare aggregates Dashboard
│   └── ReportsQueries.cs         # Implementare aggregates Reports
├── Repositories/
│   ├── UserRepository.cs
│   ├── ClientRepository.cs
│   ├── CreditRequestRepository.cs
│   ├── DecisionRepository.cs
│   └── UserPreferenceRepository.cs
└── DependencyInjection.cs        # Înregistrarea Infrastructure în DI
```

Repository-urile sunt implementări subțiri peste `AppDbContext`, expunând operațiile CRUD necesare cu metode auto-explicative. De exemplu, `ClientRepository.GetPagedAsync` implementează căutarea paginată cu filtrare server-side prin `ILIKE`:

```csharp
public async Task<(IReadOnlyList<Client> Items, int TotalCount)> GetPagedAsync(
    int page, int pageSize, string? search)
{
    var query = _context.Clients.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(search))
    {
        var pattern = $"%{search.Trim()}%";
        query = query.Where(c =>
            EF.Functions.ILike(c.FirstName, pattern) ||
            EF.Functions.ILike(c.LastName, pattern) ||
            EF.Functions.ILike(c.Email, pattern) ||
            EF.Functions.ILike(c.CNP, pattern));
    }

    var totalCount = await query.CountAsync();
    var items = await query
        .OrderByDescending(c => c.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return (items, totalCount);
}
```

### III.2.4 API Layer (`CreditApp.API`)

Reprezintă punctul de intrare HTTP în aplicație și conține:

```
CreditApp.API/
├── Controllers/             # 10 controllere
│   ├── AuthController.cs
│   ├── ClientsController.cs
│   ├── CreditRequestsController.cs
│   ├── DecisionsController.cs
│   ├── DashboardController.cs
│   ├── ReportsController.cs
│   ├── TransactionsController.cs
│   ├── UsersController.cs
│   ├── UserPreferencesController.cs
│   └── ChatController.cs
├── Middleware/
│   └── GlobalExceptionHandler.cs    # ProblemDetails pentru erori
├── Program.cs                       # Configurare pipeline + DI
├── appsettings.json
└── Dockerfile
```

Controllerele sunt foarte subțiri — primesc request-ul, extrag claim-urile JWT relevante, deleg către serviciu și returnează rezultatul. Toată logica de business stă în servicii. Acest pattern facilitează testarea izolată și menține controllerele ușor de citit. De exemplu, `DecisionsController.Create` are doar 12 linii efective:

```csharp
[HttpPost]
[Authorize(Roles = "Admin,Analyst")]
public async Task<IActionResult> Create([FromBody] CreateDecisionDto dto)
{
    var analystIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!Guid.TryParse(analystIdClaim, out var analystId))
        return Unauthorized();

    var decision = await _decisionService.CreateAsync(dto, analystId);
    return CreatedAtAction(nameof(GetById), new { id = decision.Id }, decision);
}
```

`Program.cs` orchestrează întreaga configurare: leagă opțiunile (`Configure<JwtSettings>`, `Configure<EmailSettings>`, etc.), înregistrează autentificarea JWT cu evenimentul `OnTokenValidated` care verifică `SecurityStamp`, configurează CORS cu origini configurate prin variabile de mediu, adaugă rate limiting cu două policies distincte (`auth` și `chat`), înregistrează middleware-ul global pentru erori și aplică migrațiile EF la pornire.

## III.3 Structura Frontend (React + Vite)

Frontend-ul aplicației este o Single Page Application construită cu React 19, Vite și Tailwind CSS. Structura proiectului este organizată pe responsabilități clare:

```
frontend/src/
├── api/                      # Wrappere axios per resursă
│   ├── axiosConfig.js        # Configurarea instanței comune
│   ├── authApi.js, clientsApi.js, creditRequestsApi.js, ...
│   └── errors.js             # Helper pentru extragerea mesajelor de eroare
├── components/
│   ├── chat/                 # ChatPanel, ChatLauncher, ChatMessage, ChatToolCallTrace
│   ├── layout/               # MainLayout, Sidebar
│   └── ui/                   # Componente shadcn/ui + Avatar, Pager, CreditWiseLogo
├── context/
│   └── AuthContext.jsx       # Context global pentru user + preferences
├── hooks/
│   └── useDebounce.js        # Hook custom pentru debouncing
├── pages/                    # 14 pagini, una per route principal
│   ├── auth/                 # LoginPage, ForgotPasswordPage, ResetPasswordPage
│   ├── dashboard/            # DashboardPage
│   ├── clients/              # ClientsPage
│   ├── creditrequests/       # CreditRequestsPage
│   ├── decisions/            # DecisionPanel
│   ├── transactions/         # TransactionsPage
│   ├── reports/              # ReportsPage
│   ├── users/                # UsersPage (Admin only)
│   ├── settings/             # SettingsPage
│   ├── security/             # SecurityPage
│   ├── profile/              # ProfilePage
│   └── help/                 # HelpPage
├── App.jsx                   # Router principal cu ProtectedRoute
└── main.jsx                  # Punct de intrare
```

### III.3.1 Configurarea Axios

Comunicarea cu API-ul backend se face prin instanța Axios partajată, configurată într-un singur loc pentru a evita duplicarea logicii:

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5286/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

Interceptor-ul de request adaugă automat header-ul `Authorization` la fiecare apel autenticat, eliminând necesitatea de a-l specifica manual în fiecare cerere. Interceptor-ul de response gestionează central răspunsurile 401, redirecționând utilizatorul către login — comportament necesar mai ales pentru cazul când SecurityStamp invalidează un token în mijlocul unei sesiuni active.

### III.3.2 AuthContext

Pentru a partaja starea de autentificare și preferințele utilizatorului între pagini, a fost implementat un context React global, persistat în `localStorage`:

```javascript
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const prefsData = localStorage.getItem('preferences');
        if (token && userData) {
            setUser(JSON.parse(userData));
            if (prefsData) setPreferences(JSON.parse(prefsData));
            // Reîmprospătare preferențe în background
            getPreferences().then(res => persistPreferences(res.data)).catch(() => {});
        }
        setLoading(false);
    }, []);

    const login = async (data) => { /* ... */ };
    const logout = () => { /* ... */ };
    const updateUser = async (profileData) => { /* ... */ };
    const updatePreferencesInContext = (prefs) => { /* ... */ };

    return (
        <AuthContext.Provider value={{ user, preferences, login, logout, ... }}>
            {children}
        </AuthContext.Provider>
    );
};
```

Această abordare permite oricărei componente să consume starea de autentificare prin `useAuth()` (hook custom), fără prop drilling.

### III.3.3 Componente reutilizabile

Câteva componente custom au fost dezvoltate pentru a fi reutilizate pe mai multe pagini:

**Pager** — componentă de paginare auto-adaptivă, care se ascunde când există o singură pagină de rezultate:

```javascript
const Pager = ({ page, pageSize, totalCount, totalPages, onPageChange }) => {
    if (totalCount === 0 || totalPages <= 1) return null;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    /* Render butoane Previous/Next + label X / Y */
};
```

**useDebounce** — hook custom care întârzie aplicarea unui input cu N ms, util pentru search-uri server-side:

```javascript
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
```

În ClientsPage și CreditRequestsPage, valoarea de search este filtrată prin acest hook, evitând trimiterea de request-uri către backend la fiecare keystroke.

### III.3.4 Routing și protecția rutelor

Routerul principal (React Router 7) definește rutele aplicației și aplică restricțiile de acces prin componenta `<ProtectedRoute>`:

```javascript
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Se încarcă...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
    return <MainLayout>{children}</MainLayout>;
};

// Utilizare:
<Route path="/users" element={
    <ProtectedRoute roles={['Admin']}>
        <UsersPage />
    </ProtectedRoute>
} />
<Route path="/decisions" element={
    <ProtectedRoute roles={['Admin', 'Analyst']}>
        <DecisionPanel />
    </ProtectedRoute>
} />
```

Aceasta este o protecție client-side de tip UX (utilizatorul fără permisiuni este redirecționat la dashboard), dar **niciodată nu este singura linie de apărare** — toate endpoint-urile API au atributele `[Authorize(Roles="...")]` corespunzătoare, garantând că filtrarea reală a accesului se face pe server.

## III.4 Funcționalitățile aplicației

În această secțiune sunt prezentate principalele funcționalități ale aplicației, însoțite de capturi de ecran care ilustrează interfața utilizator (vezi `docs/screenshots/`).

### III.4.1 Autentificarea

Pagina de login (`/login`) este punctul de intrare în aplicație. Pe partea stângă găsim formularul de autentificare cu câmpurile email și parolă, plus un buton de afișare a parolei și un link către resetarea ei. Pe partea dreaptă (vizibilă doar pe ecrane medium și mari), un carusel rotativ afișează vizualizări care prezintă funcționalitățile aplicației.

În cazul unei autentificări reușite, server-ul returnează un JWT și informațiile profilului, care sunt stocate în `localStorage` și utilizate pentru toate request-urile ulterioare. Utilizatorul este redirecționat automat la dashboard.

În cazul unei erori (parolă greșită, cont dezactivat), se afișează un mesaj de eroare specific. Tentativele repetate (cinci eșecuri în mai puțin de un minut) declanșează rate limiting-ul și viitoarele cereri primesc răspuns `429 Too Many Requests` timp de 60 de secunde.

### III.4.2 Resetarea parolei

Utilizatorii care și-au uitat parola pot accesa link-ul "Ai uitat parola?" din pagina de login. Introduc emailul, iar dacă acesta există în sistem, primesc un email cu un buton "Resetează parola" care duce direct la pagina de reset cu token-ul pre-populat în URL. După introducerea unei parole noi, sistemul invalidează token-ul de reset, regenerează SecurityStamp-ul utilizatorului și permite login-ul cu credențialele noi.

### III.4.3 Dashboard

Dashboard-ul (`/dashboard`) este pagina principală a aplicației și prezintă o vedere de ansamblu asupra activității. Conține:

- **Patru KPI cards** în partea de sus: Total Clienți, Cereri Credit, Rată Aprobare, Valoare Aprobată — fiecare cu o săgeată de trend care indică evoluția față de luna anterioară
- **Grafic de activitate lunară** (BarChart) cu cererile totale, aprobate și respinse din ultimele 6 luni
- **Lista celor mai recente 5 cereri** sub formă de tabel
- **Distribuție pe risc** (bar chart vertical cu procente)
- **Sumar de status** cu butoane pentru navigarea rapidă către panoul analistului
- **Card CTA** care direcționează către Reports pentru analiza detaliată

În partea de sus dreapta se află un dropdown cu informațiile utilizatorului curent, link-uri către Profil, Setări, Securitate, Ajutor și butonul de Logout.

### III.4.4 Gestionarea clienților

Pagina `/clients` afișează lista paginată a clienților, cu un input de search server-side care filtrează după nume, email sau CNP. Fiecare card de client afișează numele, emailul, CNP-ul, status-ul angajării și venitul lunar, alături de butoane Editează și Șterge (acesta din urmă vizibil doar pentru administratori).

Crearea unui client nou se face prin butonul "+ Client nou", care deschide un dialog modal cu formularul de creare. Validarea CNP-ului (unicitatea în sistem) se face server-side, iar mesajele de eroare sunt afișate inline.

### III.4.5 Cereri de credit

Pagina `/credit-requests` afișează cererile sub formă de carduri, cu informații despre client, scopul creditului, suma, termenul, scorul de credit, nivelul de risc și status-ul curent. La click pe un card se deschide un modal cu detaliile complete ale cererii și, dacă există, decizia asociată.

Crearea unei cereri noi necesită selectarea clientului dintr-un dropdown (populat asincron cu toți clienții existenți), introducerea sumei, termenului în luni și scopului. La submit, sistemul calculează automat scorul de credit prin `ScoringService` și salvează cererea cu status-ul Pending, declanșând notificarea email a analiștilor activi cu preferința corespunzătoare.

### III.4.6 Panelul analistului

Pagina `/decisions` este destinată exclusiv rolurilor Admin și Analyst. Afișează în partea de sus cererile cu status Pending sau UnderReview ("Cereri în așteptare"), iar în partea de jos istoricul deciziilor luate ("Istoric Decizii").

La click pe o cerere pendantă, se deschide un dialog detaliat cu informațiile complete despre client și cerere, plus un formular pentru introducerea sumei aprobate, ratei dobânzii și note-lor interne. Trei butoane permit cele trei tipuri de decizii: **Respinge** (roșu), **Cere Info** (gri, lasă cererea în pending) și **Aprobă Creditul** (indigo). După confirmare, decizia este salvată, status-ul cererii actualizat și clientul notificat prin email.

### III.4.7 Tranzacții

Pagina `/transactions` afișează creditele disbursate (cele cu status Approved) sub formă de tabel, cu coloane pentru client, scop, suma disbursată, rata lunară, termen, dobândă, total de rambursat (cu suma de dobândă acumulată evidențiată) și analistul care a aprobat. Calculele de rambursare (rata lunară, total payable, total dobândă) sunt efectuate de `TransactionService` pe baza formulei standard de amortizare a creditului cu dobândă fixă.

În partea de sus a paginii se află patru carduri-rezumat: numărul de contracte active, suma totală disbursată, suma totală de rambursat (cu dobânda evidențiată) și rata medie a dobânzii calculată pe toate contractele.

### III.4.8 Rapoarte

Pagina `/reports` extinde Dashboard-ul cu agregate mai detaliate destinate management-ului. Conține:

- Șase KPI cards (cereri totale, aprobate, respinse, în așteptare, rată aprobare, scor mediu)
- Trei carduri colorate gradient cu valorile monetare totale
- Grafic de activitate lunară (identic cu Dashboard)
- Distribuția cererilor pe status (PieChart)
- Distribuția cererilor pe scop (BarChart orizontal)
- Distribuția pe nivel de risc (bare orizontale colorate)
- Tabel cu performanța analiștilor (total procesate, aprobate, respinse, rată de aprobare individuală)

Toate aceste agregate sunt calculate **server-side** prin `IReportsQueries` care emite query-uri SQL native cu agregate. Pagina include un buton "Exportă PDF" care utilizează funcționalitatea `window.print()` a browser-ului, cu un set de stiluri `@media print` care ascund elementele de navigare și optimizează layout-ul pentru tipărire.

### III.4.9 Asistentul AI

Asistentul conversațional este accesibil pe orice pagină autentificată printr-un buton circular floating în colțul din dreapta-jos. La click, se deschide un panou lateral (drawer) care conține istoricul conversației și un input pentru întrebări noi. Utilizatorul poate adresa întrebări în limbaj natural (de exemplu, "Câte cereri pending sunt acum?" sau "Cine este clientul cu CNP 1900101..."), iar asistentul folosește tool-urile predefinite pentru a obține date reale și a formula răspunsuri Markdown formatate.

Detaliile arhitecturale și de implementare ale asistentului AI sunt prezentate în secțiunea III.5 (Batch B).

### III.4.10 Gestionarea utilizatorilor (Admin only)

Pagina `/users` este destinată exclusiv administratorilor și permite vizualizarea, crearea, editarea și activarea/dezactivarea conturilor de utilizator intern. Fiecare rând al tabelului afișează avatarul (cu inițialele), numele complet, emailul, rolul (cu badge colorat distinct), status-ul (Activ/Dezactivat) și data adăugării. Două iconițe permit acțiunile Editează (deschide un modal) și Activează/Dezactivează (toggle).

Crearea unui utilizator nou cere completarea numelui, prenumelui, emailului, rolului și unei parole inițiale (care va trebui schimbată de utilizator la primul login). Validarea complexității parolei se face atât client-side (pentru feedback rapid) cât și server-side (pentru robustețe).

### III.4.11 Setări și profil

Pagina `/settings` permite utilizatorului să își personalizeze preferințele: cele patru notificări email (cerere nouă, decizie luată, alerte browser, raport săptămânal), limba, formatul datei, numărul de înregistrări per pagină și tema. Modificările sunt persistate server-side prin endpoint-ul `/api/preferences` și aplicate imediat în AuthContext, ceea ce înseamnă că modificarea `itemsPerPage` se reflectă instant pe lista de clienți și cereri.

Pagina `/profile` permite actualizarea datelor personale (nume, telefon, descriere) și a culorii avatarului, iar `/security` conține formularul de schimbare a parolei.


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


\newpage

# CONCLUZII ȘI PROPUNERI DE DEZVOLTARE

## Concluzii generale

Lucrarea de față a urmărit proiectarea, implementarea și deployment-ul unei aplicații web complete pentru gestionarea cererilor de credit bancar, denumită CreditWise. Pe parcursul celor trei capitole anterioare au fost prezentate tehnologiile utilizate, deciziile arhitecturale, structura concretă a codului și modul de implementare al fiecărei componente, începând de la schema bazei de date și până la asistentul conversațional AI integrat în interfața utilizator.

Aplicația rezultată reprezintă **un sistem funcțional end-to-end**, accesibil public prin internet, capabil să gestioneze fluxul complet al unei cereri de credit — de la înregistrarea clientului în sistem, la evaluarea automatizată a riscului, asistarea analistului în luarea deciziei, notificarea automată a clientului și urmărirea ulterioară a creditului disbursat sub formă de tranzacție. Sistemul deservește trei roluri distincte (Administrator, Analist și Bancher), fiecare cu un set specific de permisiuni și fluxuri de lucru.

Atingerea acestui obiectiv a necesitat integrarea unui număr considerabil de tehnologii și paradigme moderne. Pe partea backend, alegerea stack-ului **.NET 9 + ASP.NET Core Web API + Entity Framework Core** a oferit o platformă matură, performantă și cu un ecosistem extins, permițând organizarea codului pe principiile **Clean Architecture** cu cele patru layere clasice. Pe partea frontend, **React 19 + Vite + Tailwind CSS + shadcn/ui** au oferit un mediu modern de dezvoltare a interfețelor utilizator responsive și estetice. La nivel de bază de date, **PostgreSQL** găzduit pe **Supabase** a asigurat scalabilitate și disponibilitate cross-device fără efort operațional.

Una dintre realizările care diferențiază CreditWise de o aplicație CRUD generică este **integrarea asistentului conversațional AI bazat pe Anthropic Claude cu paradigma Tool Use**. Această componentă demonstrează nu doar abilitatea de a integra un model lingvistic mare într-o aplicație reală, ci și capacitatea de a-l face să opereze pe date proprii organizației, respectând regulile de autorizare existente, fără a inventa informații. Asistentul răspunde la întrebări în limbaj natural (română sau engleză), apelează tool-uri concrete pentru a obține date reale și prezintă răspunsuri formatate Markdown cu trace transparent al apelurilor efectuate.

Din punct de vedere al **deployment-ului**, aplicația rulează în producție pe o topologie distribuită formată din trei platforme cloud specializate — Vercel pentru frontend, Render pentru backend și Supabase pentru baza de date — combinată cu Resend pentru trimiterea email-urilor. Această configurație demonstrează ciclul complet de viață al unei aplicații moderne, de la dezvoltarea locală containerizată cu Docker până la rularea în producție accesibilă public, cu workflow de continuous deployment declanșat automat de orice push pe branch-ul principal.

## Realizările principale

Recapitulând la nivel sintetic, realizările concrete ale proiectului includ:

1. **29 de endpoint-uri API REST**, organizate în 10 controllere, acoperind autentificare, gestiune utilizatori, clienți, cereri credit, decizii, tranzacții, dashboard, rapoarte, preferințe și chat AI.

2. **14 pagini de interfață utilizator** dezvoltate în React, cu suport responsive pentru ecrane mobile, tablete și desktop.

3. **5 entități de domeniu** modelate corect relațional (Users, Clients, CreditRequests, Decisions, UserPreferences), cu cheile externe configurate cu comportamente cascade adecvate pentru fiecare scenariu de business.

4. **9 migrații Entity Framework Core** versionate alături de codul sursă, care permit reproducerea exactă a schemei bazei de date în orice mediu.

5. **7 tools read-only** expuse model-ului AI prin paradigma Tool Use, cu schema JSON Schema completă și filtrare server-side pe baza identității și rolului utilizatorului.

6. **3 template-uri HTML responsive** pentru email-uri, cu fallback plain-text, integrate cu două providere distincte (MailKit pentru dev, Resend pentru producție).

7. **2 policies de rate limiting** distincte (`auth` per IP, `chat` per user) pentru protecția endpoint-urilor sensibile împotriva abuzului.

8. **Algoritm de scoring** ponderat pe 4 factori (raport datorii/venituri, stabilitatea angajării, raport sumă/venit anual, vârstă) care produce un scor numeric și clasifică automat cererile pe trei niveluri de risc.

9. **Pipeline complet de deployment** containerizat cu Docker, orchestrat local cu docker-compose, rulat în producție pe topologia cloud descrisă mai sus.

10. **Documentație tehnică completă** incluzând diagrame UML (use case, secvență, ER), diagramă de arhitectură, README detaliat și colecție Postman cu toate endpoint-urile.

## Limitări identificate

O analiză onestă a sistemului implementat trebuie să recunoască și limitările pe care le are. Aceste limitări nu sunt deficiențe ascunse, ci alegeri conștiente impuse de constrângerile unui proiect academic individual cu termen limitat. Identificarea lor explicită deschide drumul către secțiunea următoare, dedicată propunerilor de dezvoltare ulterioară.

### Lipsa suitei de teste automate

Așa cum a fost discutat în secțiunea III.9, strategia de testare s-a concentrat pe verificarea manuală end-to-end a fluxurilor critice, prin scenarii bine definite și colecția Postman. Această abordare este pragmatică pentru un proiect de această dimensiune și termen, dar nu oferă protecția împotriva regresiilor pe care o suită completă de teste automate ar fi furnizat-o. Pentru orice evoluție ulterioară a sistemului către un mediu de producție real cu utilizatori activi, scrierea de teste unitare pentru servicii și teste de integrare pentru endpoint-uri ar deveni o necesitate.

### Stocarea JWT-ului în localStorage

Alegerea de a stoca JWT-ul în `localStorage` în loc de cookie HttpOnly are avantajul simplității implementării (nu necesită configurare CSRF) dar expune token-ul la atacuri de tip XSS în cazul în care un atacator reușește să injecteze cod JavaScript în pagină. Pentru o aplicație bancară reală, această decizie ar trebui revizuită în favoarea cookie-urilor HttpOnly cu SameSite=Strict, în combinație cu un endpoint dedicat de refresh token.

### Lipsa autentificării cu doi factori

Sistemul curent oferă o autentificare bazată exclusiv pe parolă. Pentru un mediu bancar real, autentificarea cu doi factori (2FA) prin aplicații TOTP (Google Authenticator, Authy) sau prin SMS ar fi obligatorie. Implementarea ar necesita biblioteci suplimentare (de exemplu, `Otp.NET` pentru .NET) și modificări atât pe partea de backend (validare cod), cât și pe partea de UI (ecran intermediar de introducere a codului).

### Absența jurnalului de audit

Acțiunile critice ale utilizatorilor (login, schimbare parolă, creare/ștergere clienți, decizii pe cereri) nu sunt înregistrate într-un jurnal de audit dedicat. Pentru o aplicație bancară reală, acest jurnal ar fi obligatoriu pentru conformitate cu reglementări precum GDPR sau directive de tip PSD2. Implementarea ar putea fi realizată prin middleware EF Core sau prin pattern-ul Outbox.

### Lipsa internaționalizării reale

Deși sistemul oferă opțiunea de schimbare a limbii în setări, traducerile efective ale interfeței nu au fost implementate. Pentru o aplicație multilingvă reală, ar fi necesară integrarea unei biblioteci precum `i18next` (frontend) și `Microsoft.Extensions.Localization` (backend), cu fișiere de resurse pentru fiecare limbă.

### Absența integrării cu Bureau-ul de Credit

Algoritmul de scoring actual operează exclusiv pe baza datelor introduse manual în sistem (venit lunar declarat, cheltuieli declarate, status angajare). Într-un mediu bancar real, scoring-ul ar fi îmbogățit cu interogări către Biroul de Credit Român (BCR) pentru a verifica istoricul de credit al solicitantului, eventualele întârzieri la plată sau restanțele active.

### Lipsa testelor de performanță sub încărcare

Aplicația nu a fost supusă unor teste de încărcare (load testing) sistematice cu unelte precum JMeter sau k6. Performanța raportată empiric (sub un secund pentru majoritatea endpoint-urilor) este măsurată în condiții de dezvoltare cu un singur utilizator. Comportamentul sub 100, 1000 sau 10000 de utilizatori concurenți nu este măsurat și ar putea revela bottleneck-uri (de exemplu, conexiunile la baza de date).

### Tier-uri gratuite cu limitări

Topologia cloud actuală (Render Free + Vercel Hobby + Supabase Free + Resend Free) este suficientă pentru un demo, dar are limitări recunoscute: instanța Render "adoarme" după 15 minute de inactivitate (cold start de ~30s la primul request), Supabase Free are limită de 500 MB stocare și conexiuni concurente limitate, Resend Free permite maxim 100 email-uri pe zi. Trecerea către un trafic real ar necesita migrarea către tier-uri plătite.

## Propuneri de dezvoltare viitoare

Pornind de la limitările identificate mai sus și de la oportunitățile de evoluție naturală a sistemului, pot fi formulate următoarele propuneri concrete de dezvoltare:

### Pe termen scurt (1-3 luni)

**Implementarea autentificării cu doi factori (2FA)** prin aplicații TOTP. Aceasta este îmbunătățirea de securitate cu cel mai mare raport beneficiu/efort și ar putea fi implementată în 2-3 zile.

**Migrarea JWT-ului în cookie HttpOnly** și implementarea unui mecanism de refresh token. Această modificare necesită ajustări atât pe backend (setarea cookie-urilor în Response, citirea lor în Request, endpoint `/auth/refresh`), cât și pe frontend (eliminarea logicii de stocare în localStorage), dar elimină o întreagă clasă de vulnerabilități XSS.

**Adăugarea unei suite de teste unitare** pentru cele mai critice servicii (`AuthService`, `DecisionService`, `ScoringService`) folosind xUnit și Moq. Țintirea unui coverage de 70-80% pe aceste componente ar oferi o bună plasă de siguranță împotriva regresiilor.

**Scrierea testelor de integrare** pentru endpoint-urile principale folosind `WebApplicationFactory<T>` din `Microsoft.AspNetCore.Mvc.Testing`, cu o bază de date in-memory sau o instanță efemeră PostgreSQL în container.

**Implementarea jurnalului de audit** prin middleware EF Core, cu salvarea modificărilor în tabela dedicată `AuditLogs` (cu coloane User, Action, EntityType, EntityId, OldValue, NewValue, Timestamp).

### Pe termen mediu (3-6 luni)

**Internaționalizarea completă a interfeței** prin integrarea `i18next` și extragerea tuturor string-urilor în fișiere JSON dedicate pentru română și engleză. Limba activă ar fi citită din preferințele utilizatorului.

**Sistem de notificări în-app în timp real** prin SignalR sau WebSockets, care să afișeze toast-uri instant atunci când un eveniment relevant se produce (cerere nouă pentru analist, decizie luată pentru bancher etc.) — alternativ sau complementar email-urilor.

**Pagină de Calendar și Termene de plată** pentru tranzacțiile active, care să afișeze scadențele lunare ale fiecărui credit aprobat și să permită bifarea rambursărilor efectuate. Implementarea ar necesita o entitate nouă `Payment` cu relație N:1 către `CreditRequest`.

**Generare rapoarte PDF pe server-side** prin biblioteci precum QuestPDF sau iTextSharp, în locul utilizării `window.print()` din browser. Aceasta ar permite generarea de rapoarte cu paginare exactă, header/footer custom și descărcare directă fără pași manuali ai utilizatorului.

**Implementarea funcției "Recover Account" prin SMS** pentru cazurile în care utilizatorul își uită parola și nu mai are acces la email. Necesită integrare cu un provider SMS (Twilio, Vonage).

### Pe termen lung (6-12 luni)

**Integrarea cu Biroul de Credit Român (BCR)** pentru îmbogățirea scoring-ului cu istoric real de credit. Integrarea ar necesita un cont API la BCR (proces de validare al instituției) și implementarea unui adaptor `IBureauService` care să returneze datele relevante.

**Aplicație mobilă nativă** pentru clienții finali, dezvoltată în React Native (reutilizând o parte din componentele și logica frontend-ului web). Clienții ar putea aplica pentru un credit, încărca documente justificative, urmări status-ul cererilor și calendarul ratelor lunare.

**Sistem de încărcare și OCR pentru documente** (carte identitate, adeverință venit, fluturaș salariu) care să extragă automat datele relevante și să le pre-populeze în formulare. Aceasta ar reduce semnificativ timpul de introducere manuală a datelor de către operator.

**Integrarea cu serviciul ANAF** pentru verificarea CNP-ului și a datelor declarate de client. Necesită un cont de access la serviciile ANAF și un parser pentru răspunsurile XML/JSON.

**Implementarea de tablouri de bord configurabile** care să permită fiecărui utilizator să își aleagă widget-urile pe care le vede pe Dashboard și să le rearanjeze prin drag-and-drop.

**Migrarea componentei AI către modele on-premises** (Llama 3, Mistral) hostate intern, pentru a elimina dependența de API extern și pentru a îmbunătăți confidențialitatea datelor sensibile transmise către model. Această migrare ar necesita un GPU dedicat și framework-uri de inferență (vLLM, Ollama).

**Implementarea unei rute API publice pentru parteneri** (banci colaboratoare, comparatoare de credite) care să expună o subdiviziune a funcționalităților sub forma unui API documentat cu OpenAPI, cu autentificare prin API keys și rate limiting per cheie.

### Direcții de cercetare aplicată

Dincolo de îmbunătățirile incrementale, sistemul oferă un cadru excelent pentru explorări de tip cercetare aplicată:

**Antrenarea unui model propriu de scoring** pe bază de date istorice de credite acordate, cu rezultate cunoscute (rambursate la timp, întârziate, executate silit). Tehnici precum gradient boosting (XGBoost) sau rețele neuronale ar putea descoperi tipare neevidente între caracteristicile clientului și probabilitatea de default.

**Explorarea tehnicilor de explicabilitate (XAI)** pentru deciziile algoritmice. Într-un context bancar reglementat, clientul are dreptul de a primi o explicație clară a motivului pentru care cererea sa a fost respinsă. Tehnici precum SHAP sau LIME ar putea oferi această transparență.

**Implementarea unui sistem de detecție a fraudei** care să analizeze pattern-uri suspecte în cererile depuse (de exemplu, CNP-uri consecutive, adrese identice între clienți, sume rotunjite suspect).

**Dezvoltarea unei interfețe vocale** pentru asistentul AI, prin integrarea cu API-uri de speech-to-text și text-to-speech, permițând utilizatorului să interogheze sistemul prin vorbire directă.

## Concluzii finale

Realizarea acestui proiect a reprezentat o oportunitate semnificativă de aprofundare a numeroase tehnologii moderne și paradigme arhitecturale, dincolo de simpla expunere academică. Provocările întâmpinate pe parcursul dezvoltării — de la decizii de design (Clean Architecture vs arhitectură monolitică, JavaScript vs TypeScript, paradigma Tool Use vs RAG pentru asistentul AI), la probleme tehnice concrete (limitarea SMTP a tier-ului Render, conexiuni IPv6-only Supabase, focus bug-ul React la PasswordField re-mount), la decizii de produs (cum se prezintă transparența tool call-urilor către utilizator) — au reprezentat experiențe formative care depășesc cu mult conținutul tipic al unei lucrări de licență.

Una dintre lecțiile cele mai valoroase consolidate pe parcursul proiectului este faptul că **deciziile arhitecturale corecte se amortizează în timp**. Investiția inițială în structurarea pe Clean Architecture, deși a părut excesivă pentru cele câteva entități inițiale, a făcut posibilă adăugarea ulterioară a unor componente complexe (chatbot AI, sistem dual de email, rate limiting, autorizare per rol) fără a destabiliza codul existent. Această experiență validează empiric principiile teoretice studiate în cadrul cursurilor de Programare Orientată Obiect, Ingineria Programării și Baze de Date.

O altă observație importantă este că **integrarea inteligenței artificiale într-o aplicație reală necesită mult mai mult decât un simplu apel API**. Paradigma Tool Use, prompt caching-ul, filtrarea per rol, trace-ul tool call-urilor în interfață, gestiunea erorilor de model — toate aceste aspecte fac diferența între un demo superficial și o componentă utilizabilă efectiv în context business. Această experiență contradice imaginea simplistă pe care o au unele documentații publice despre integrarea cu LLM-uri și oferă o perspectivă realistă asupra efortului real necesar.

În concluzie, aplicația CreditWise reprezintă **un punct de start solid**, nu un punct terminal. Topologia tehnologică aleasă, arhitectura modulară pe Clean Architecture și pipeline-ul de deployment continuu oferă fundația pe care propunerile de dezvoltare enumerate mai sus pot fi adăugate iterativ. Sistemul este suficient de complex pentru a fi relevant ca demonstrație de abilități tehnice, suficient de matur pentru a fi prezentat ca proiect de licență și suficient de modular pentru a continua să evolueze dincolo de acest stadiu.

\newpage

# BIBLIOGRAFIE

## Cărți și publicații tehnice

1. Martin, R. C. — **Clean Architecture: A Craftsman's Guide to Software Structure and Design**, Prentice Hall, 2017, ISBN 978-0134494166.

2. Martin, R. C. — **Clean Code: A Handbook of Agile Software Craftsmanship**, Prentice Hall, 2008, ISBN 978-0132350884.

3. Evans, E. — **Domain-Driven Design: Tackling Complexity in the Heart of Software**, Addison-Wesley Professional, 2003, ISBN 978-0321125217.

4. Fowler, M. — **Patterns of Enterprise Application Architecture**, Addison-Wesley Professional, 2002, ISBN 978-0321127426.

5. Gamma, E., Helm, R., Johnson, R., Vlissides, J. — **Design Patterns: Elements of Reusable Object-Oriented Software**, Addison-Wesley Professional, 1994, ISBN 978-0201633610.

6. Newman, S. — **Building Microservices: Designing Fine-Grained Systems**, 2nd Edition, O'Reilly Media, 2021, ISBN 978-1492034025.

7. Richardson, L., Amundsen, M., Ruby, S. — **RESTful Web APIs**, O'Reilly Media, 2013, ISBN 978-1449358068.

8. Vaswani, A. et al. — **Attention Is All You Need**, în *Advances in Neural Information Processing Systems* (NeurIPS), 2017, pp. 5998-6008.

9. Brown, T. et al. — **Language Models are Few-Shot Learners**, în *Advances in Neural Information Processing Systems* (NeurIPS), 2020.

## Documentație oficială tehnologii

10. Microsoft — **.NET Documentation**, accesat în perioada 2026, disponibil la: `https://learn.microsoft.com/en-us/dotnet/`

11. Microsoft — **ASP.NET Core Documentation**, accesat în perioada 2026, disponibil la: `https://learn.microsoft.com/en-us/aspnet/core/`

12. Microsoft — **Entity Framework Core Documentation**, accesat în perioada 2026, disponibil la: `https://learn.microsoft.com/en-us/ef/core/`

13. Microsoft — **Rate limiting middleware in ASP.NET Core**, accesat în 2026, disponibil la: `https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit`

14. Meta — **React Documentation**, accesat în perioada 2026, disponibil la: `https://react.dev/`

15. Vercel — **Vite Documentation**, accesat în perioada 2026, disponibil la: `https://vitejs.dev/`

16. Tailwind Labs — **Tailwind CSS Documentation**, accesat în perioada 2026, disponibil la: `https://tailwindcss.com/docs`

17. shadcn — **shadcn/ui Documentation**, accesat în perioada 2026, disponibil la: `https://ui.shadcn.com/`

18. Remix Software — **React Router Documentation**, accesat în perioada 2026, disponibil la: `https://reactrouter.com/`

19. PostgreSQL Global Development Group — **PostgreSQL 16 Documentation**, accesat în perioada 2026, disponibil la: `https://www.postgresql.org/docs/16/`

20. Supabase — **Supabase Documentation**, accesat în perioada 2026, disponibil la: `https://supabase.com/docs`

21. Docker, Inc. — **Docker Documentation**, accesat în perioada 2026, disponibil la: `https://docs.docker.com/`

22. nginx, Inc. — **Nginx Documentation**, accesat în perioada 2026, disponibil la: `https://nginx.org/en/docs/`

23. Anthropic — **Claude API Documentation**, accesat în perioada 2026, disponibil la: `https://docs.anthropic.com/`

24. Anthropic — **Tool Use Guide**, accesat în perioada 2026, disponibil la: `https://docs.anthropic.com/en/docs/build-with-claude/tool-use`

25. Anthropic — **Prompt Caching Documentation**, accesat în perioada 2026, disponibil la: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching`

26. Resend, Inc. — **Resend API Documentation**, accesat în perioada 2026, disponibil la: `https://resend.com/docs`

27. .NET Foundation — **MailKit Documentation**, accesat în perioada 2026, disponibil la: `https://github.com/jstedfast/MailKit`

28. Vercel — **Vercel Platform Documentation**, accesat în perioada 2026, disponibil la: `https://vercel.com/docs`

29. Render Services, Inc. — **Render Documentation**, accesat în perioada 2026, disponibil la: `https://render.com/docs`

30. Recharts — **Recharts Documentation**, accesat în perioada 2026, disponibil la: `https://recharts.org/en-US/`

## Standarde și specificații

31. IETF RFC 7519 — **JSON Web Token (JWT)**, Internet Engineering Task Force, mai 2015, disponibil la: `https://datatracker.ietf.org/doc/html/rfc7519`

32. IETF RFC 7807 — **Problem Details for HTTP APIs**, Internet Engineering Task Force, martie 2016, disponibil la: `https://datatracker.ietf.org/doc/html/rfc7807`

33. IETF RFC 7231 — **Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content**, Internet Engineering Task Force, iunie 2014.

34. IETF RFC 6749 — **The OAuth 2.0 Authorization Framework**, Internet Engineering Task Force, octombrie 2012.

35. W3C — **Cross-Origin Resource Sharing (CORS)**, World Wide Web Consortium, accesat în 2026, disponibil la: `https://www.w3.org/TR/cors/`

36. ECMA International — **ECMAScript 2024 Language Specification**, ECMA-262, ediția 15, iunie 2024.

37. ISO/IEC 9075 — **Information technology — Database languages — SQL**, International Organization for Standardization.

## Resurse online și articole tehnice

38. OWASP Foundation — **OWASP Top 10:2021**, accesat în perioada 2026, disponibil la: `https://owasp.org/Top10/`

39. OWASP Foundation — **Authentication Cheat Sheet**, accesat în perioada 2026, disponibil la: `https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html`

40. OWASP Foundation — **Password Storage Cheat Sheet**, accesat în perioada 2026, disponibil la: `https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html`

41. Provos, N., Mazières, D. — **A Future-Adaptable Password Scheme**, USENIX Annual Technical Conference, 1999 — articolul original care introduce algoritmul bcrypt.

42. Fielding, R. T. — **Architectural Styles and the Design of Network-based Software Architectures**, dizertație doctorală, University of California, Irvine, 2000 — sursa originală a stilului REST.

43. MDN Web Docs — **HTTP Documentation**, Mozilla Developer Network, accesat în perioada 2026, disponibil la: `https://developer.mozilla.org/en-US/docs/Web/HTTP`

44. MDN Web Docs — **JavaScript Reference**, accesat în perioada 2026, disponibil la: `https://developer.mozilla.org/en-US/docs/Web/JavaScript`

45. Anthropic — **Constitutional AI: Harmlessness from AI Feedback**, lucrare de cercetare, 2022.

46. Anthropic — **Claude Sonnet 4.6 Model Card**, accesat în perioada 2026, disponibil la: `https://www.anthropic.com/`

## Reglementări și standarde de securitate

47. Regulamentul (UE) 2016/679 — **Regulamentul General privind Protecția Datelor (GDPR)**, Parlamentul European și Consiliul Uniunii Europene, 27 aprilie 2016.

48. Directiva (UE) 2015/2366 — **Directiva privind serviciile de plată în cadrul pieței interne (PSD2)**, Parlamentul European și Consiliul Uniunii Europene, 25 noiembrie 2015.

49. Banca Națională a României — **Regulamentul nr. 17/2012 privind cerințele minime pentru sistemele bancare interne**, București, 2012.

50. NIST — **Special Publication 800-63B: Digital Identity Guidelines**, National Institute of Standards and Technology, 2017.

## Diagrame și unelte de modelare

51. Object Management Group — **Unified Modeling Language (UML) 2.5.1 Specification**, decembrie 2017.

52. dbdiagram.io — **DBML (Database Markup Language) Documentation**, accesat în perioada 2026, disponibil la: `https://dbml.dbdiagram.io/`

53. PlantUML — **PlantUML Language Reference Guide**, accesat în perioada 2026, disponibil la: `https://plantuml.com/`

54. Mermaid — **Mermaid Documentation**, accesat în perioada 2026, disponibil la: `https://mermaid.js.org/`

## Note privind bibliografia

Sursele consultate pe parcursul elaborării acestei lucrări au inclus, pe lângă bibliografia formală listată mai sus, numeroase resurse online de tip Stack Overflow, GitHub Discussions, dev.to, Medium, precum și documentația interactivă a bibliotecilor utilizate. Acestea au fost folosite pentru rezolvarea unor probleme tehnice punctuale apărute pe parcursul dezvoltării și nu au fost incluse în listă întrucât nu constituie surse academice referențiabile, dar contribuția lor la realizarea practică a proiectului a fost esențială.

De asemenea, anumite decizii arhitecturale au fost influențate de explorări iterative ale unor proiecte open-source de referință din ecosistemul .NET (Clean Architecture solution template by Steve Smith, Jason Taylor's Clean Architecture template), care au fost studiate pentru bunele practici de organizare a codului, fără a fi folosite ca atare în acest proiect.
