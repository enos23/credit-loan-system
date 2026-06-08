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
