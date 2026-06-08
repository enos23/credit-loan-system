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
