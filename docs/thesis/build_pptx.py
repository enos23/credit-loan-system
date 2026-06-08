"""Generator prezentare PPTX pentru lucrarea de licență CreditWise."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import os

# === Constante de design ===
SCREENSHOTS = "/home/enos/credit-loan-system/docs/screenshots"
DIAGRAMS = "/home/enos/credit-loan-system/docs/diagrams/exports"
OUTPUT = "/home/enos/credit-loan-system/docs/thesis/PREZENTARE-LICENTA.pptx"

INDIGO = RGBColor(0x4F, 0x46, 0xE5)
DARK_NAVY = RGBColor(0x1E, 0x1B, 0x4B)
INDIGO_LIGHT = RGBColor(0xE0, 0xE7, 0xFF)
GRAY_TEXT = RGBColor(0x4B, 0x55, 0x63)
GRAY_LIGHT = RGBColor(0xF3, 0xF4, 0xF6)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
EMERALD = RGBColor(0x10, 0xB9, 0x81)
AMBER = RGBColor(0xF5, 0x9E, 0x0B)
ROSE = RGBColor(0xF4, 0x3F, 0x5E)

FONT = "Calibri"

# === Setup ===
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height

BLANK = prs.slide_layouts[6]


# === Helpers ===
def add_rect(slide, x, y, w, h, color, line_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if line_color is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line_color
    shape.shadow.inherit = False
    return shape


def add_text(slide, x, y, w, h, text, size=18, bold=False, color=DARK_NAVY,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, font=FONT):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.05)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return tb


def add_bullets(slide, x, y, w, h, items, size=16, color=GRAY_TEXT, line_spacing=1.2):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.1)
    for i, item in enumerate(items):
        if isinstance(item, tuple):
            label, body = item
        else:
            label, body = None, item
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.line_spacing = line_spacing
        p.space_after = Pt(6)
        bullet = p.add_run()
        bullet.text = "▸ "
        bullet.font.name = FONT
        bullet.font.size = Pt(size)
        bullet.font.color.rgb = INDIGO
        bullet.font.bold = True
        if label:
            r1 = p.add_run()
            r1.text = label + " "
            r1.font.name = FONT
            r1.font.size = Pt(size)
            r1.font.bold = True
            r1.font.color.rgb = DARK_NAVY
            r2 = p.add_run()
            r2.text = body
            r2.font.name = FONT
            r2.font.size = Pt(size)
            r2.font.color.rgb = color
        else:
            r = p.add_run()
            r.text = body
            r.font.name = FONT
            r.font.size = Pt(size)
            r.font.color.rgb = color
    return tb


def add_header_bar(slide, title, subtitle=None):
    """Banda colorată în partea de sus cu titlul slide-ului."""
    add_rect(slide, 0, 0, SW, Inches(0.06), INDIGO)
    add_text(slide, Inches(0.5), Inches(0.25), Inches(12), Inches(0.7),
             title, size=28, bold=True, color=DARK_NAVY)
    if subtitle:
        add_text(slide, Inches(0.5), Inches(0.9), Inches(12), Inches(0.4),
                 subtitle, size=14, color=GRAY_TEXT)
    add_rect(slide, Inches(0.5), Inches(1.35), Inches(0.6), Inches(0.04), INDIGO)


def add_footer(slide, page_num, total):
    add_rect(slide, 0, SH - Inches(0.35), SW, Inches(0.35), GRAY_LIGHT)
    add_text(slide, Inches(0.5), SH - Inches(0.33), Inches(10), Inches(0.3),
             "CreditWise — Aplicație Web pentru Gestionarea Cererilor de Credit",
             size=10, color=GRAY_TEXT)
    add_text(slide, SW - Inches(2.5), SH - Inches(0.33), Inches(2), Inches(0.3),
             f"{page_num} / {total}", size=10, color=GRAY_TEXT, align=PP_ALIGN.RIGHT)


def add_picture_fit(slide, path, x, y, w, h):
    """Inserează imaginea în box-ul (x,y,w,h) păstrând proporția."""
    from PIL import Image
    img = Image.open(path)
    iw, ih = img.size
    box_ratio = w / h
    img_ratio = iw / ih
    if img_ratio > box_ratio:
        new_w = w
        new_h = int(w / img_ratio)
    else:
        new_h = h
        new_w = int(h * img_ratio)
    nx = x + (w - new_w) // 2
    ny = y + (h - new_h) // 2
    pic = slide.shapes.add_picture(path, nx, ny, new_w, new_h)
    return pic


TOTAL = 15

# ==========================================
# SLIDE 1 — TITLE
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_rect(slide, 0, 0, SW, SH, WHITE)
add_rect(slide, 0, 0, SW, Inches(2.2), DARK_NAVY)
add_rect(slide, 0, Inches(2.2), SW, Inches(0.08), INDIGO)

# Logo / brand sus
add_text(slide, Inches(0.6), Inches(0.4), Inches(12), Inches(0.4),
         "UNIVERSITATEA DIN ORADEA",
         size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, Inches(0.6), Inches(0.85), Inches(12), Inches(0.4),
         "Facultatea de Informatică și Științe • Lucrare de Licență • 2026",
         size=12, color=INDIGO_LIGHT, align=PP_ALIGN.CENTER)

# Titlu mare
add_text(slide, Inches(0.6), Inches(2.8), Inches(12), Inches(1.0),
         "CreditWise",
         size=60, bold=True, color=DARK_NAVY, align=PP_ALIGN.CENTER)
add_text(slide, Inches(0.6), Inches(3.9), Inches(12), Inches(0.6),
         "Aplicație Web pentru Gestionarea Cererilor de Credit Bancar",
         size=22, color=INDIGO, align=PP_ALIGN.CENTER)
add_text(slide, Inches(0.6), Inches(4.5), Inches(12), Inches(0.5),
         "cu Asistent AI Integrat (Anthropic Claude — Tool Use)",
         size=16, color=GRAY_TEXT, align=PP_ALIGN.CENTER)

# Linie decorativă
add_rect(slide, Inches(5.5), Inches(5.3), Inches(2.3), Inches(0.04), INDIGO)

# Coordonator (stânga jos) + Absolvent (dreapta jos)
add_text(slide, Inches(0.8), Inches(5.9), Inches(5), Inches(0.4),
         "COORDONATOR ȘTIINȚIFIC", size=11, bold=True, color=GRAY_TEXT)
add_text(slide, Inches(0.8), Inches(6.3), Inches(5), Inches(0.5),
         "[Numele coordonatorului]", size=18, bold=True, color=DARK_NAVY)

add_text(slide, SW - Inches(5.8), Inches(5.9), Inches(5), Inches(0.4),
         "ABSOLVENT", size=11, bold=True, color=GRAY_TEXT, align=PP_ALIGN.RIGHT)
add_text(slide, SW - Inches(5.8), Inches(6.3), Inches(5), Inches(0.5),
         "[Numele absolventului]", size=18, bold=True, color=DARK_NAVY, align=PP_ALIGN.RIGHT)

# ==========================================
# SLIDE 2 — Tema lucrării și motivație
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Tema lucrării", "Digitalizarea procesului de creditare bancară")

add_text(slide, Inches(0.6), Inches(1.7), Inches(12.2), Inches(1.2),
         "Procesul tradițional de gestionare a cererilor de credit — analiză manuală, evaluare subiectivă a riscului, "
         "comunicare ad-hoc cu clienții — este consumator de timp, predispus la erori și dificil de scalat.",
         size=16, color=GRAY_TEXT)

# Card cu soluția
add_rect(slide, Inches(0.6), Inches(3.0), Inches(12.2), Inches(2.5), INDIGO_LIGHT)
add_rect(slide, Inches(0.6), Inches(3.0), Inches(0.1), Inches(2.5), INDIGO)
add_text(slide, Inches(0.95), Inches(3.15), Inches(11.5), Inches(0.5),
         "Soluția propusă: CreditWise", size=20, bold=True, color=DARK_NAVY)
add_bullets(slide, Inches(0.95), Inches(3.7), Inches(11.5), Inches(1.7), [
    "Sistem web complet pentru gestionarea unitară a fluxului de creditare",
    "Trei roluri distincte: Administrator, Analist și Bancher",
    "Asistent AI conversațional (Tool Use) pentru interogarea datelor în limbaj natural",
    "Deployment în cloud distribuit, accesibil public",
], size=15)

add_footer(slide, 2, TOTAL)

# ==========================================
# SLIDE 3 — Obiectivele lucrării
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Obiectivele lucrării")

add_bullets(slide, Inches(0.6), Inches(1.8), Inches(12), Inches(5), [
    ("Modelarea domeniului", "— entități, relații, schemă relațională normalizată"),
    ("Sistem CRUD complet", "cu paginare, căutare și filtrare server-side"),
    ("Scoring automat al riscului", "— algoritm ponderat pe 4 factori"),
    ("Autentificare și autorizare", "cu JWT, SecurityStamp, rate limiting, validare strictă"),
    ("Asistent AI conversațional", "bazat pe Claude Sonnet 4.6 cu paradigma Tool Use"),
    ("Notificări email", "cu template-uri HTML și provider dual (MailKit + Resend)"),
    ("Interfață responsive", "(React 19 + Tailwind + shadcn/ui) — mobile, tablet, desktop"),
    ("Containerizare și deployment cloud", "(Docker + Vercel + Render + Supabase)"),
    ("Securitate la nivel industrial", "(BCrypt, secrete în env vars, CORS configurabil)"),
    ("Documentație tehnică completă", "(diagrame UML, README, colecție Postman)"),
], size=15)

add_footer(slide, 3, TOTAL)

# ==========================================
# SLIDE 4 — Stack tehnologic
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Stack tehnologic", "Tehnologii moderne, mature, larg adoptate în industrie")

# Grilă 3x2 cu categorii
categories = [
    ("FRONTEND", INDIGO, [
        "React 19 + Vite",
        "Tailwind CSS + shadcn/ui",
        "React Router 7 + Recharts",
    ]),
    ("BACKEND", DARK_NAVY, [
        ".NET 9 + ASP.NET Core",
        "Clean Architecture (4 layere)",
        "Entity Framework Core 9",
    ]),
    ("BAZA DE DATE", EMERALD, [
        "PostgreSQL 16",
        "Supabase (Session Pooler)",
        "9 migrații EF Core",
    ]),
    ("INTELIGENȚĂ ARTIFICIALĂ", AMBER, [
        "Anthropic Claude Sonnet 4.6",
        "Tool Use (7 tools read-only)",
        "Prompt caching (70-90% reducere)",
    ]),
    ("EMAIL", ROSE, [
        "MailKit + MailHog (dev)",
        "Resend HTTPS REST (prod)",
        "Template-uri HTML responsive",
    ]),
    ("DEVOPS & CLOUD", INDIGO, [
        "Docker + docker-compose",
        "Vercel (frontend)",
        "Render (backend) + GitHub CI/CD",
    ]),
]

col_w = Inches(4.0)
row_h = Inches(2.4)
start_x = Inches(0.6)
start_y = Inches(1.85)
gap_x = Inches(0.25)
gap_y = Inches(0.25)

for idx, (title, color, items) in enumerate(categories):
    col = idx % 3
    row = idx // 3
    x = start_x + col * (col_w + gap_x)
    y = start_y + row * (row_h + gap_y)
    add_rect(slide, x, y, col_w, row_h, GRAY_LIGHT)
    add_rect(slide, x, y, col_w, Inches(0.4), color)
    add_text(slide, x + Inches(0.15), y + Inches(0.05), col_w, Inches(0.35),
             title, size=12, bold=True, color=WHITE)
    add_bullets(slide, x + Inches(0.15), y + Inches(0.55), col_w - Inches(0.3), Inches(1.7),
                items, size=12)

add_footer(slide, 4, TOTAL)

# ==========================================
# SLIDE 5 — Arhitectura Clean Architecture
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Arhitectura aplicației", "Clean Architecture — patru layere concentrice")

# Desenăm cele 4 layere concentrice
center_x = Inches(3.5)
center_y = Inches(4.4)
sizes = [Inches(5.5), Inches(4.3), Inches(3.1), Inches(1.9)]
colors_layers = [
    (INDIGO_LIGHT, "API (Controllers, Middleware)"),
    (RGBColor(0xC7, 0xD2, 0xFE), "Infrastructure (EF, HTTP, Email)"),
    (RGBColor(0xA5, 0xB4, 0xFC), "Application (Services, DTOs)"),
    (INDIGO, "Domain (Entities, Interfaces)"),
]
for size, (color, label) in zip(sizes, colors_layers):
    s = slide.shapes.add_shape(MSO_SHAPE.OVAL,
                                int(center_x - size / 2),
                                int(center_y - size / 2),
                                size, size)
    s.fill.solid()
    s.fill.fore_color.rgb = color
    s.line.color.rgb = WHITE
    s.line.width = Pt(2)

# Etichete pentru fiecare layer
labels_y = [Inches(1.85), Inches(2.5), Inches(3.15), Inches(4.0)]
for ly, (_, label) in zip(labels_y, colors_layers):
    add_text(slide, Inches(2.5), ly, Inches(2), Inches(0.4),
             label.split(" (")[0],
             size=11, bold=True, color=DARK_NAVY if "Domain" != label.split(" (")[0] else WHITE,
             align=PP_ALIGN.CENTER)

# Descriere pe dreapta
add_rect(slide, Inches(7.5), Inches(1.7), Inches(5.3), Inches(5.0), GRAY_LIGHT)
add_text(slide, Inches(7.7), Inches(1.85), Inches(5), Inches(0.5),
         "Regula dependențelor", size=18, bold=True, color=DARK_NAVY)
add_text(slide, Inches(7.7), Inches(2.4), Inches(5), Inches(0.6),
         "Dependențele se orientează strict spre interior, niciodată invers.",
         size=12, color=GRAY_TEXT)

add_bullets(slide, Inches(7.7), Inches(3.2), Inches(5), Inches(3.5), [
    ("Domain:", "entități pure, fără dependențe"),
    ("Application:", "logica de business, servicii"),
    ("Infrastructure:", "EF Core, HTTP, SMTP/REST"),
    ("API:", "controllere, middleware, DI"),
    ("Beneficiu:", "testabilitate + schimbarea tehnologiilor cu impact minim"),
], size=11)

add_footer(slide, 5, TOTAL)

# ==========================================
# SLIDE 6 — Schema bazei de date
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Schema bazei de date", "5 entități principale, relații cu cascade explicit configurate")

# Pune diagrama ER pe stânga
add_picture_fit(slide, os.path.join(DIAGRAMS, "dbdiagram.png"),
                Inches(0.4), Inches(1.7), Inches(7.5), Inches(5.4))

# Detalii pe dreapta
add_rect(slide, Inches(8.2), Inches(1.7), Inches(4.7), Inches(5.4), GRAY_LIGHT)
add_text(slide, Inches(8.4), Inches(1.85), Inches(4.5), Inches(0.5),
         "Entități și relații", size=16, bold=True, color=DARK_NAVY)

add_bullets(slide, Inches(8.4), Inches(2.45), Inches(4.4), Inches(4.5), [
    ("Users", "— utilizatori interni cu SecurityStamp"),
    ("Clients", "— solicitanți (CNP unic)"),
    ("CreditRequests", "— cereri cu scor & risc"),
    ("Decisions", "— relație 1:1 cu cererea"),
    ("UserPreferences", "— notificări, limbă, paginare"),
    ("9 migrații EF", "— versionate alături de cod"),
    ("Cascade Restrict pe Analyst", "= audit trail"),
], size=11)

add_footer(slide, 6, TOTAL)

# ==========================================
# SLIDE 7 — Actorii sistemului
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Roluri și permisiuni", "Trei actori distincti, autorizare verificată la 3 niveluri")

# Tabel cu 3 coloane: Admin, Analyst, Banker
col_w = Inches(4.0)
gap = Inches(0.2)
start_x = Inches(0.6)
y_top = Inches(1.85)

roles = [
    ("ADMIN", DARK_NAVY, [
        "Creare / dezactivare utilizatori",
        "Modificare roluri",
        "Ștergere clienți",
        "Toate funcționalitățile Analyst",
        "Toate funcționalitățile Banker",
        "Asistent AI fără restricții",
    ]),
    ("ANALYST", INDIGO, [
        "Vizualizare toate cererile",
        "Aprobă / respinge cereri",
        "Solicitare info suplimentare",
        "Vizualizare istoric decizii",
        "Vizualizare tranzacții",
        "Asistent AI cu toate tools",
    ]),
    ("BANKER", EMERALD, [
        "Creare / editare clienți",
        "Înregistrare cereri noi",
        "Vizualizare cereri (limitat)",
        "Fără acces note interne",
        "Fără acces tranzacții",
        "Asistent AI cu tools filtrate",
    ]),
]

for idx, (title, color, perms) in enumerate(roles):
    x = start_x + idx * (col_w + gap)
    add_rect(slide, x, y_top, col_w, Inches(5.0), GRAY_LIGHT)
    add_rect(slide, x, y_top, col_w, Inches(0.6), color)
    add_text(slide, x, y_top + Inches(0.1), col_w, Inches(0.4),
             title, size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_bullets(slide, x + Inches(0.2), y_top + Inches(0.8),
                col_w - Inches(0.4), Inches(4.0), perms, size=12)

# Notă jos despre defense in depth
add_text(slide, Inches(0.6), Inches(6.95), Inches(12.2), Inches(0.3),
         "Verificare la 3 niveluri: middleware [Authorize(Roles=...)] • servicii (business logic) • filtrare tools AI",
         size=11, color=GRAY_TEXT, align=PP_ALIGN.CENTER)

add_footer(slide, 7, TOTAL)

# ==========================================
# SLIDE 8 — Fluxul cererii (sequence)
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Fluxul cererii de credit", "Patru faze: înregistrare → notificare → decizie → notificare client")

# Diagram pe stânga
add_picture_fit(slide, os.path.join(DIAGRAMS, "sequence-credit-flow.png"),
                Inches(0.4), Inches(1.7), Inches(6.0), Inches(5.5))

# Faze pe dreapta
add_text(slide, Inches(6.8), Inches(1.85), Inches(6), Inches(0.5),
         "Cele patru faze", size=18, bold=True, color=DARK_NAVY)

phases = [
    ("1", "Înregistrarea cererii", "Bancherul completează formularul; backend-ul calculează scorul prin ScoringService și salvează cererea cu status Pending."),
    ("2", "Notificarea analiștilor", "Email-uri trimise tuturor analiștilor activi cu preferința pornită — fire-and-forget, nu blochează tranzacția."),
    ("3", "Decizia analistului", "Analistul deschide panelul, completează suma + dobânda + note, alege Aprobă / Respinge / Cere Info."),
    ("4", "Notificarea clientului", "Email automat către client cu rezultatul deciziei și detaliile financiare."),
]

y = Inches(2.45)
for num, title, desc in phases:
    # Cerc cu număr
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.8), y, Inches(0.5), Inches(0.5))
    circle.fill.solid()
    circle.fill.fore_color.rgb = INDIGO
    circle.line.fill.background()
    add_text(slide, Inches(6.8), y + Inches(0.05), Inches(0.5), Inches(0.4),
             num, size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, Inches(7.5), y, Inches(5.3), Inches(0.35),
             title, size=13, bold=True, color=DARK_NAVY)
    add_text(slide, Inches(7.5), y + Inches(0.35), Inches(5.3), Inches(0.8),
             desc, size=10, color=GRAY_TEXT)
    y += Inches(1.15)

add_footer(slide, 8, TOTAL)

# ==========================================
# SLIDE 9 — Algoritmul de scoring
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Algoritmul de scoring", "Sistem ponderat cu reguli explicite — 4 factori, scor 0-100")

# 4 carduri cu factori
factors = [
    ("30 pct", "Rata îndatorării", "datorii_totale / venit_lunar\nsub 30% → 30 pct\npeste 50% → 0 pct", INDIGO),
    ("25 pct", "Stabilitatea angajării", "Employed → 25\nRetired → 20\nSelfEmployed → 15\nUnemployed → 0", DARK_NAVY),
    ("25 pct", "Sumă / Venit anual", "sub 12 luni venit → 25\n12-24 luni → 15\nover 36 luni → 0", EMERALD),
    ("20 pct", "Vârsta", "25-55 ani → 20\n56-65 ani → 15\n18-24 ani → 10\nalte → 0", AMBER),
]

card_w = Inches(2.9)
card_h = Inches(3.2)
start_x = Inches(0.6)
y = Inches(1.85)
gap = Inches(0.25)

for idx, (weight, name, formula, color) in enumerate(factors):
    x = start_x + idx * (card_w + gap)
    add_rect(slide, x, y, card_w, card_h, GRAY_LIGHT)
    add_rect(slide, x, y, card_w, Inches(0.7), color)
    add_text(slide, x, y + Inches(0.05), card_w, Inches(0.4),
             weight, size=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, x, y + Inches(0.8), card_w, Inches(0.4),
             name, size=14, bold=True, color=DARK_NAVY, align=PP_ALIGN.CENTER)
    # Formulă
    tb = slide.shapes.add_textbox(x + Inches(0.2), y + Inches(1.35),
                                   card_w - Inches(0.4), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(formula.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = line
        r.font.name = "Consolas"
        r.font.size = Pt(10)
        r.font.color.rgb = GRAY_TEXT

# Interpretare jos
add_rect(slide, Inches(0.6), Inches(5.4), Inches(12.2), Inches(1.6), INDIGO_LIGHT)
add_text(slide, Inches(0.9), Inches(5.55), Inches(12), Inches(0.4),
         "Interpretarea scorului final (0-100)", size=14, bold=True, color=DARK_NAVY)

tb = slide.shapes.add_textbox(Inches(0.9), Inches(6.0), Inches(12), Inches(1.0))
tf = tb.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
parts = [
    ("80-100: ", DARK_NAVY, True, 13),
    ("Risc scăzut", EMERALD, True, 13),
    (" (aprobat, dobândă 5.5%)   •   ", GRAY_TEXT, False, 12),
    ("60-79: ", DARK_NAVY, True, 13),
    ("Risc mediu", AMBER, True, 13),
    (" (aprobat, 9.0%)   •   ", GRAY_TEXT, False, 12),
    ("0-59: ", DARK_NAVY, True, 13),
    ("Risc ridicat", ROSE, True, 13),
    (" (respingere / 14.0%)", GRAY_TEXT, False, 12),
]
for text, col, bold, sz in parts:
    r = p.add_run()
    r.text = text
    r.font.name = FONT
    r.font.size = Pt(sz)
    r.font.bold = bold
    r.font.color.rgb = col

add_text(slide, Inches(0.9), Inches(6.55), Inches(12), Inches(0.3),
         "Decizia finală îi aparține întotdeauna analistului — scorul este doar asistare informațională.",
         size=11, color=GRAY_TEXT)

add_footer(slide, 9, TOTAL)

# ==========================================
# SLIDE 10 — Interfața: Login + Dashboard
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Interfața — Autentificare și Dashboard")

# Login stânga
add_text(slide, Inches(0.6), Inches(1.7), Inches(6), Inches(0.4),
         "Login + Reset parolă", size=14, bold=True, color=INDIGO)
add_picture_fit(slide, os.path.join(SCREENSHOTS, "Login_Page.png"),
                Inches(0.6), Inches(2.15), Inches(6.0), Inches(4.6))

# Dashboard dreapta
add_text(slide, Inches(7.0), Inches(1.7), Inches(6), Inches(0.4),
         "Dashboard cu KPI și trend lunar", size=14, bold=True, color=INDIGO)
add_picture_fit(slide, os.path.join(SCREENSHOTS, "Dashboard.png"),
                Inches(7.0), Inches(2.15), Inches(6.0), Inches(4.6))

add_footer(slide, 10, TOTAL)

# ==========================================
# SLIDE 11 — Cereri + Panel analist
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Cereri de credit și Panelul Analistului")

add_text(slide, Inches(0.6), Inches(1.7), Inches(6), Inches(0.4),
         "Lista cererilor cu scoring și risc", size=14, bold=True, color=INDIGO)
add_picture_fit(slide, os.path.join(SCREENSHOTS, "Cereri_Credit.png"),
                Inches(0.6), Inches(2.15), Inches(6.0), Inches(4.6))

add_text(slide, Inches(7.0), Inches(1.7), Inches(6), Inches(0.4),
         "Workflow decizional al analistului", size=14, bold=True, color=INDIGO)
add_picture_fit(slide, os.path.join(SCREENSHOTS, "Panel_Analist.png"),
                Inches(7.0), Inches(2.15), Inches(6.0), Inches(4.6))

add_footer(slide, 11, TOTAL)

# ==========================================
# SLIDE 12 — Asistentul AI
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Asistent conversațional AI", "Anthropic Claude Sonnet 4.6 cu paradigma Tool Use")

# Screenshot chatbot
add_picture_fit(slide, os.path.join(SCREENSHOTS, "ChatBot_AI.png"),
                Inches(0.6), Inches(1.85), Inches(7.5), Inches(5.0))

# Detalii pe dreapta
add_rect(slide, Inches(8.4), Inches(1.85), Inches(4.5), Inches(5.0), GRAY_LIGHT)
add_text(slide, Inches(8.6), Inches(2.0), Inches(4.3), Inches(0.4),
         "Cum funcționează?", size=16, bold=True, color=DARK_NAVY)

add_bullets(slide, Inches(8.6), Inches(2.55), Inches(4.2), Inches(4.3), [
    ("Tool Use:", "modelul apelează funcții reale, nu inventează"),
    ("7 tools read-only:", "clients, requests, decisions, KPIs"),
    ("Filtrare per rol:", "Banker nu primește tools restricționate"),
    ("Prompt caching:", "reducere cost 70-90%"),
    ("Max 5 iterații:", "evită bucle infinite"),
    ("Trace UI:", "afișează tool calls pentru transparență"),
    ("Rate limit:", "20 mesaje / 5 min / user"),
], size=11)

add_footer(slide, 12, TOTAL)

# ==========================================
# SLIDE 13 — Securitate + Deployment
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Securitate și Deployment")

# Securitate stânga
add_rect(slide, Inches(0.6), Inches(1.85), Inches(6.0), Inches(5.0), GRAY_LIGHT)
add_rect(slide, Inches(0.6), Inches(1.85), Inches(6.0), Inches(0.5), DARK_NAVY)
add_text(slide, Inches(0.8), Inches(1.93), Inches(5.8), Inches(0.4),
         "SECURITATE", size=14, bold=True, color=WHITE)
add_bullets(slide, Inches(0.8), Inches(2.5), Inches(5.6), Inches(4.2), [
    ("BCrypt cost 11", "+ salt aleatoriu (100-200ms / hash)"),
    ("JWT + SecurityStamp", "— invalidare instant"),
    ("Rate limiting", "— 5/min IP (auth), 20/5min user (chat)"),
    ("CORS configurabil", "prin variabile de mediu"),
    ("Validare strictă", "client-side + server-side"),
    ("ProblemDetails RFC 7807", "— fără leak de detalii"),
    ("Zero credențiale în repo", "— user-secrets + env vars"),
], size=11)

# Deployment dreapta — topology
add_rect(slide, Inches(6.9), Inches(1.85), Inches(6.0), Inches(5.0), GRAY_LIGHT)
add_rect(slide, Inches(6.9), Inches(1.85), Inches(6.0), Inches(0.5), INDIGO)
add_text(slide, Inches(7.1), Inches(1.93), Inches(5.8), Inches(0.4),
         "TOPOLOGIE CLOUD", size=14, bold=True, color=WHITE)

# Mini-topology diagram cu 4 boxes
boxes = [
    ("Vercel", "Frontend\nReact + Vite", Inches(7.1), Inches(2.6), EMERALD),
    ("Render", "Backend\n.NET 9 API", Inches(9.7), Inches(2.6), INDIGO),
    ("Supabase", "PostgreSQL 16\nSession Pooler", Inches(7.1), Inches(4.4), DARK_NAVY),
    ("Resend", "HTTPS REST\nEmail", Inches(9.7), Inches(4.4), AMBER),
]
for name, sub, x, y, color in boxes:
    add_rect(slide, x, y, Inches(2.5), Inches(1.4), WHITE)
    add_rect(slide, x, y, Inches(2.5), Inches(0.35), color)
    add_text(slide, x, y + Inches(0.02), Inches(2.5), Inches(0.3),
             name, size=12, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, x + Inches(0.1), y + Inches(0.45), Inches(2.3), Inches(0.9),
             sub, size=10, color=GRAY_TEXT, align=PP_ALIGN.CENTER)

add_text(slide, Inches(7.1), Inches(6.05), Inches(5.7), Inches(0.6),
         "Containerizat Docker • CI/CD automat • SSL end-to-end",
         size=11, color=GRAY_TEXT, align=PP_ALIGN.CENTER)

add_footer(slide, 13, TOTAL)

# ==========================================
# SLIDE 14 — Implementări viitoare
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_header_bar(slide, "Implementări viitoare", "Direcții de dezvoltare pe trei orizonturi de timp")

# 3 coloane pe orizonturi
cols = [
    ("TERMEN SCURT", "1-3 luni", EMERALD, [
        "2FA prin TOTP (Google Authenticator)",
        "JWT în cookie HttpOnly + refresh token",
        "Teste unitare xUnit + Moq (70-80%)",
        "Teste integrare WebApplicationFactory",
        "Jurnal de audit prin middleware EF",
    ]),
    ("TERMEN MEDIU", "3-6 luni", INDIGO, [
        "Internaționalizare completă (i18next)",
        "Notificări în-app SignalR / WebSockets",
        "Pagina Calendar plăți + entitate Payment",
        "Generare PDF server-side (QuestPDF)",
        "Recover account prin SMS (Twilio)",
    ]),
    ("TERMEN LUNG", "6-12 luni", DARK_NAVY, [
        "Integrare Biroul de Credit Român (BCR)",
        "Aplicație mobilă React Native pentru clienți",
        "OCR documente identitate + adeverințe",
        "Integrare ANAF pentru validare CNP",
        "Model ML propriu de scoring",
        "Migrare AI on-premises (Llama / Mistral)",
    ]),
]

col_w = Inches(4.0)
gap = Inches(0.2)
start_x = Inches(0.6)
y_top = Inches(1.85)

for idx, (title, sub, color, items) in enumerate(cols):
    x = start_x + idx * (col_w + gap)
    add_rect(slide, x, y_top, col_w, Inches(5.0), GRAY_LIGHT)
    add_rect(slide, x, y_top, col_w, Inches(0.85), color)
    add_text(slide, x, y_top + Inches(0.1), col_w, Inches(0.4),
             title, size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, x, y_top + Inches(0.45), col_w, Inches(0.3),
             sub, size=11, color=WHITE, align=PP_ALIGN.CENTER)
    add_bullets(slide, x + Inches(0.2), y_top + Inches(1.05),
                col_w - Inches(0.4), Inches(3.8), items, size=11)

add_footer(slide, 14, TOTAL)

# ==========================================
# SLIDE 15 — Concluzii + Mulțumiri
# ==========================================
slide = prs.slides.add_slide(BLANK)
add_rect(slide, 0, 0, SW, SH, WHITE)

# Header indigo
add_rect(slide, 0, 0, SW, Inches(1.5), DARK_NAVY)
add_text(slide, Inches(0.6), Inches(0.4), Inches(12), Inches(0.6),
         "Concluzii", size=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, Inches(0.6), Inches(1.0), Inches(12), Inches(0.4),
         "Sumarul realizărilor și perspective", size=14, color=INDIGO_LIGHT, align=PP_ALIGN.CENTER)

# 3 carduri orizontale cu realizările
y = Inches(1.95)
cards = [
    ("29", "endpoint-uri REST API", INDIGO),
    ("14", "pagini frontend responsive", EMERALD),
    ("7", "tools AI cu Tool Use", AMBER),
    ("5", "entități + 9 migrații EF", DARK_NAVY),
]
card_w = Inches(2.95)
gap = Inches(0.15)
for idx, (num, label, color) in enumerate(cards):
    x = Inches(0.6) + idx * (card_w + gap)
    add_rect(slide, x, y, card_w, Inches(1.3), GRAY_LIGHT)
    add_rect(slide, x, y, Inches(0.1), Inches(1.3), color)
    add_text(slide, x + Inches(0.2), y + Inches(0.1), card_w, Inches(0.7),
             num, size=36, bold=True, color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.85), card_w - Inches(0.2), Inches(0.4),
             label, size=11, color=GRAY_TEXT)

# Mesaj final
add_rect(slide, Inches(0.6), Inches(3.55), Inches(12.2), Inches(2.4), INDIGO_LIGHT)
add_text(slide, Inches(0.95), Inches(3.7), Inches(11.5), Inches(0.5),
         "Lecții consolidate", size=18, bold=True, color=DARK_NAVY)
add_bullets(slide, Inches(0.95), Inches(4.2), Inches(11.5), Inches(1.7), [
    "Deciziile arhitecturale corecte se amortizează în timp — Clean Architecture a permis adăugarea facilă a AI, email, rate limiting",
    "Integrarea AI într-o aplicație reală depășește mult un simplu apel API — Tool Use + filtrare + transparență fac diferența",
    "CreditWise este un punct de start solid, nu un punct terminal — modular, scalabil, evolutiv",
], size=12)

# Mulțumiri
add_text(slide, Inches(0.6), Inches(6.25), Inches(12.2), Inches(0.7),
         "Vă mulțumesc pentru atenție!", size=28, bold=True, color=INDIGO, align=PP_ALIGN.CENTER)
add_text(slide, Inches(0.6), Inches(6.95), Inches(12.2), Inches(0.3),
         "Întrebări?", size=14, color=GRAY_TEXT, align=PP_ALIGN.CENTER)

# Salvare
prs.save(OUTPUT)
print(f"OK: {OUTPUT}")
print(f"Slides: {len(prs.slides)}")
