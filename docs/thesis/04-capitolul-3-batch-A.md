# CAPITOLUL III — IMPLEMENTAREA APLICAȚIEI (Batch A)

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

---

În acest batch al Capitolului III au fost prezentate structura bazei de date, structura proiectului backend și frontend, plus principalele funcționalități user-facing ale aplicației. În Batch B se continuă cu detaliile arhitecturale ale componentelor specializate: chatbot-ul AI, sistemul de email, măsurile concrete de securitate, containerizarea și deployment-ul, precum și strategia de testare.
