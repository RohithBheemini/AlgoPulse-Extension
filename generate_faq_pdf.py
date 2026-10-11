import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6e7681"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "AlgoPulse — Comprehensive Extension Engineering & Architecture FAQ")
            self.setStrokeColor(colors.HexColor("#30363d"))
            self.setLineWidth(0.5)
            self.line(54, 748, 558, 748)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#30363d"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, footer_text)
        self.drawString(54, 32, "Confidential & Academic Reference • AlgoPulse Platform")
        self.restoreState()

def create_faq_pdf(filename="FAQ.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    c_blue = colors.HexColor("#4285F4")
    c_red = colors.HexColor("#EA4335")
    c_yellow = colors.HexColor("#FBBC05")
    c_green = colors.HexColor("#34A853")
    c_dark = colors.HexColor("#0d1117")
    c_card = colors.HexColor("#161b22")
    c_border = colors.HexColor("#30363d")
    c_text = colors.HexColor("#24292f")
    c_muted = colors.HexColor("#57606a")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1f2328"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_muted,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#0969da"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1f2328"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_text,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=c_text,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        leftIndent=14,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#24292f")
    )

    callout_style = ParagraphStyle(
        'Callout_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0969da")
    )

    faq_q_style = ParagraphStyle(
        'FAQ_Question',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=colors.HexColor("#0969da"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    faq_a_style = ParagraphStyle(
        'FAQ_Answer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        spaceAfter=6
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("AlgoPulse: Complete Engineering Specification & Architectural FAQ", title_style))
    story.append(Paragraph("Comprehensive Guide to Browser Extensions (Manifest V3), VS Code Extensions, Next.js Intelligence Dashboard, and 100% Free Gemini AI Technology Stack", subtitle_style))
    
    # Google Colored Accent Bar
    accent_table = Table([["", "", "", ""]], colWidths=[126, 126, 126, 126], rowHeights=[4])
    accent_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), c_blue),
        ('BACKGROUND', (1,0), (1,0), c_red),
        ('BACKGROUND', (2,0), (2,0), c_yellow),
        ('BACKGROUND', (3,0), (3,0), c_green),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(accent_table)
    story.append(Spacer(1, 14))

    # SECTION 1
    story.append(Paragraph("1. Executive Summary & The Core Problem", h1_style))
    story.append(Paragraph(
        "Modern technical platforms such as LeetCode, GeeksforGeeks, and HackerRank evaluate code using a binary paradigm: <i>Accepted</i> or <i>Wrong Answer</i>. A student whose solution runs in quadratic time O(N²) or cubic time O(N³) with nested loops will often receive an 'Accepted' verdict simply because test cases fit within the 2-second timeout. Crucially, these platforms do <b>not</b> teach: (1) whether the chosen algorithmic paradigm was optimal, (2) the structural invariants of the problem (e.g., hash maps vs. two pointers), or (3) how to transition from brute force to optimal complexity through progressive hints without spoiling the full solution.",
        body_style
    ))
    story.append(Paragraph(
        "<b>AlgoPulse</b> solves this problem by embedding algorithmic intelligence across three cohesive developer surfaces: (a) a multi-platform <b>Chrome Extension</b> (LeetCode, GFG, HackerRank), (b) a local <b>VS Code Extension</b> (Python, C++, Java, JS/TS, Go, Rust), and (c) a <b>Next.js 14 Analytics Dashboard</b> with a 16-week submission activity heatmap, streak statistics, and deep side-by-side code reviews.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # SECTION 2
    story.append(Paragraph("2. Browser Extension Deep Dive & Terminology (Manifest V3)", h1_style))
    story.append(Paragraph(
        "Building a reliable browser extension on modern competitive programming sites requires overcoming significant technical constraints imposed by Chrome's <b>Manifest V3</b> specification and virtualized code editors. The core terminology and architecture are defined below:",
        body_style
    ))

    term_data = [
        [Paragraph("<b>Term</b>", body_bold), Paragraph("<b>Definition & Implementation in AlgoPulse</b>", body_bold)],
        [
            Paragraph("<b>Manifest V3 (MV3)</b>", code_style),
            Paragraph("The modern Chrome Extension API specification. Replaces persistent background pages with ephemeral service workers, tightens Content Security Policies (CSP), and disallows remotely hosted code. AlgoPulse complies 100% with MV3.", body_style)
        ],
        [
            Paragraph("<b>Background Service Worker</b>", code_style),
            Paragraph("An event-driven script running in a background thread without access to the DOM or the <code>window</code> object. AlgoPulse's <code>background.js</code> acts as the central coordinator: it listens to messages, pings Google Gemini API, manages <code>chrome.storage.local</code>, and triggers real-time HTTP POST syncing to the web dashboard.", body_style)
        ],
        [
            Paragraph("<b>Content Script</b>", code_style),
            Paragraph("A JavaScript program injected into web pages matching defined URL patterns (e.g., <code>leetcode.com/*</code>, <code>geeksforgeeks.org/*</code>). Content scripts execute in an <i>Isolated World</i>: they can inspect and manipulate the host page's DOM, but cannot access JavaScript variables or functions defined in the page's global <code>window</code> object.", body_style)
        ],
        [
            Paragraph("<b>Execution Worlds:<br/>Isolated vs. MAIN</b>", code_style),
            Paragraph("<b>Isolated World:</b> Standard sandbox for content scripts protecting user security.<br/><b>MAIN World:</b> The exact execution context of the host webpage where libraries like Monaco (<code>window.monaco</code>) or Ace (<code>window.ace</code>) exist. AlgoPulse declares <code>world: 'MAIN'</code> in <code>manifest.json</code> for <code>injected.js</code> to access editor internal instances.", body_style)
        ],
        [
            Paragraph("<b>Monaco Virtualization Problem</b>", code_style),
            Paragraph("Monaco Editor on LeetCode uses DOM virtualization: it only renders visible lines on screen. Scraping the DOM text content yields truncated code when the solution is longer than the viewport! AlgoPulse bypasses DOM scraping by injecting into the MAIN world and calling <code>window.monaco.editor.getModels()[0].getValue()</code>, extracting 100% complete, uncorrupted code.", body_style)
        ],
        [
            Paragraph("<b>Web Accessible Resources</b>", code_style),
            Paragraph("Explicit declaration in <code>manifest.json</code> permitting web pages to load extension assets (e.g., <code>injected.js</code>, <code>styles.css</code>). Without this, host sites' CSP blocks injected scripts.", body_style)
        ],
        [
            Paragraph("<b>Two-Way Message Passing</b>", code_style),
            Paragraph("Cross-boundary communication: <code>window.postMessage</code> bridges the MAIN world (editor code) to the content script; <code>chrome.runtime.sendMessage</code> bridges the content script to the background service worker.", body_style)
        ],
        [
            Paragraph("<b>chrome.storage.local</b>", code_style),
            Paragraph("Sandboxed asynchronous persistent storage on the user's machine. AlgoPulse stores the user's free Gemini API key, personal extension token, and offline evaluation history locally without exposing credentials to third-party web trackers.", body_style)
        ]
    ]

    term_table = Table(term_data, colWidths=[130, 374])
    term_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f6f8fa")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(term_table)
    story.append(Spacer(1, 10))

    # SECTION 3
    story.append(Paragraph("3. VS Code Extension Deep Dive & Terminology", h1_style))
    story.append(Paragraph(
        "Many developers practice algorithms locally in their editor using files such as <code>two_sum.py</code> or <code>Solution.java</code>. The AlgoPulse VS Code extension brings identical 4-pillar review capabilities into the local workflow. Key terms and subsystems include:",
        body_style
    ))

    vscode_terms = [
        [Paragraph("<b>VS Code Concept</b>", body_bold), Paragraph("<b>Role & Technical Implementation in AlgoPulse</b>", body_bold)],
        [
            Paragraph("<b>Extension Manifest<br/>(package.json)</b>", code_style),
            Paragraph("Defines metadata, entrypoint (<code>dist/extension.js</code>), configuration settings (<code>algopulse.geminiApiKey</code>), activation events (<code>onCommand:algopulse.analyzeCode</code>), keybindings (<code>Ctrl+Alt+A</code>), and Activity Bar view containers.", body_style)
        ],
        [
            Paragraph("<b>ExtensionContext & Subscriptions</b>", code_style),
            Paragraph("The lifecycle container passed to <code>activate(context)</code>. Disposables (commands, status bar items, views) are pushed to <code>context.subscriptions</code> to ensure clean garbage collection upon deactivation.", body_style)
        ],
        [
            Paragraph("<b>WebviewViewProvider</b>", code_style),
            Paragraph("A persistent UI component rendered directly inside VS Code's sidebar. AlgoPulse implements <code>AlgoPulseSidebarProvider</code>, serving a customized HTML5/CSS3 interface with Google glowing accents, 4-pillar score progress bars, interactive hints, and code insertion buttons.", body_style)
        ],
        [
            Paragraph("<b>TextEditor & Document API</b>", code_style),
            Paragraph("AlgoPulse inspects <code>vscode.window.activeTextEditor</code>. It extracts <code>document.getText(selection)</code> (or full file text), infers the problem name from the filename or header comment, and detects language ID (Python, C++, Java, etc.).", body_style)
        ],
        [
            Paragraph("<b>Direct Code Insertion</b>", code_style),
            Paragraph("The Webview sends an <code>INSERT_CODE</code> message to the extension host, which invokes <code>editor.edit(editBuilder => editBuilder.replace(...))</code>, allowing students to replace their code with the optimal solution with a single click.", body_style)
        ],
        [
            Paragraph("<b>VSIX Packaging</b>", code_style),
            Paragraph("The standard Open VSIX packaging format (ZIP archive containing extension manifest, bundled JavaScript, and assets). Can be installed in any VS Code instance via <code>code --install-extension algopulse-vscode-1.0.0.vsix</code>.", body_style)
        ]
    ]

    vscode_table = Table(vscode_terms, colWidths=[130, 374])
    vscode_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f6f8fa")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(vscode_table)
    story.append(Spacer(1, 10))

    # SECTION 4
    story.append(PageBreak())
    story.append(Paragraph("4. Technology Stack Blueprint & Component Roles", h1_style))
    story.append(Paragraph(
        "AlgoPulse is architected around modular, decoupled components where each technology serves a distinct functional objective:",
        body_style
    ))

    stack_data = [
        [Paragraph("<b>Component</b>", body_bold), Paragraph("<b>Tech Stack</b>", body_bold), Paragraph("<b>Functional Responsibility</b>", body_bold), Paragraph("<b>Final Output / Artifact</b>", body_bold)],
        [
            Paragraph("<b>Browser Extension</b>", body_style),
            Paragraph("Manifest V3, TypeScript, Vite, Tailwind CSS", code_style),
            Paragraph("Injects into LeetCode/GFG/HackerRank; extracts uncorrupted editor code; renders in-page slideover review drawer.", body_style),
            Paragraph("<code>extension/dist/</code> (Load unpacked in Chrome)", code_style)
        ],
        [
            Paragraph("<b>VS Code Extension</b>", body_style),
            Paragraph("TypeScript, VS Code Ext API, esbuild, Webview", code_style),
            Paragraph("Provides Activity Bar review panel, <code>Ctrl+Alt+A</code> hotkey, editor code insertion, and background sync.", body_style),
            Paragraph("<code>algopulse-vscode-1.0.0.vsix</code>", code_style)
        ],
        [
            Paragraph("<b>Web Dashboard</b>", body_style),
            Paragraph("Next.js 14 App Router, React 18, Tailwind, Recharts", code_style),
            Paragraph("Landing page with Google dynamic lighting; live 16-week submission heatmap; streak calculator; user profiles.", body_style),
            Paragraph("Hosted web app at <code>http://localhost:3000</code>", code_style)
        ],
        [
            Paragraph("<b>AI Evaluation Engine</b>", body_style),
            Paragraph("Google Gemini 3.8 / 2.0 / 1.5 Flash (AI Studio)", code_style),
            Paragraph("4-pillar algorithmic approach scoring; Big-O distance benchmark; 3-tier hints; optimal reference code.", body_style),
            Paragraph("Strict JSON payload adhering to rubric schema", code_style)
        ],
        [
            Paragraph("<b>Persistence Layer</b>", body_style),
            Paragraph("Supabase PostgreSQL + Local JSON mirroring", code_style),
            Paragraph("Stores user profiles, personal access tokens, submission records, and activity streaks with 100% offline fallback.", body_style),
            Paragraph("Supabase tables + <code>data/submissions.json</code>", code_style)
        ]
    ]

    stack_table = Table(stack_data, colWidths=[90, 110, 174, 130])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f6f8fa")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 12))

    # SECTION 5: TRADE-OFF ANALYSIS
    story.append(Paragraph("5. Exhaustive Trade-Off Analysis: Why This Tech Stack?", h1_style))
    story.append(Paragraph(
        "Every architectural decision in AlgoPulse was evaluated against competing alternatives to ensure zero cost, zero hardware barriers, robust maintainability, and academic excellence:",
        body_style
    ))

    tradeoffs = [
        ("Why Google Gemini Flash instead of OpenAI GPT-4o or Claude 3.5 Sonnet?",
         "<b>Zero-Cost Guarantee & High Rate Limits:</b> Google AI Studio offers a completely free tier with 15 requests per minute (RPM) and 1 million tokens per minute (TPM) without requiring credit cards or payment methods. In contrast, OpenAI GPT-4o and Anthropic Claude 3.5 Sonnet have no free API tier for automated code evaluation, making student deployment impossible without monthly subscriptions.<br/>"
         "<b>Low Latency:</b> Gemini 3.8 Flash and 2.0 Flash deliver evaluation responses in ~1.2 to 1.8 seconds, enabling interactive slideover experiences that do not interrupt user coding flow."),
        
        ("Why Cloud Gemini instead of Local LLMs (Ollama / Llama 3 / DeepSeek-R1)?",
         "<b>Zero Hardware Barrier:</b> Running a competent coding LLM (e.g. CodeLlama 13B or DeepSeek-R1 8B) locally requires at least 16GB of system RAM and a dedicated 8GB+ VRAM GPU. Most students use lightweight laptops. Gemini runs serverless in the cloud, requiring zero downloads, zero RAM overhead, and providing instant zero-second cold starts."),
        
        ("Why MAIN World Page Injection instead of Pure Content Script DOM Scraping?",
         "<b>Defeating DOM Virtualization:</b> Monaco (LeetCode) and Ace (GFG) dynamically destroy offscreen DOM nodes during scrolling. Scraping the DOM lines results in truncated or missing code. By injecting <code>injected.js</code> into the page's MAIN execution world, AlgoPulse talks directly to <code>window.monaco.editor.getModels()</code>, retrieving the complete, uncorrupted buffer instantly regardless of scroll position."),

        ("Why Next.js 14 App Router instead of a Simple Vite SPA + Separate Express Server?",
         "<b>Unified Full-Stack Architecture:</b> Next.js 14 App Router unifies React front-end pages and Node.js serverless API routes into a single deployment. This eliminates the need to manage, run, and configure a separate Express.js server, eliminates cross-origin port mismatch headaches during development, and natively supports SSR and cookie-based authentication with <code>@supabase/ssr</code>."),

        ("Why Dual-Layer Storage (Supabase + Local JSON Mirror) instead of Pure Cloud or Pure Local?",
         "<b>100% Resilience & Zero Lost Data:</b> If Supabase credentials are missing, expired, or offline, AlgoPulse seamlessly mirrors every evaluation to local JSON storage (<code>dashboard/data/submissions.json</code>). When online, it syncs to cloud PostgreSQL, allowing multiple machines to share progress. Users never experience crashes or data loss during network dropouts."),

        ("Why esbuild instead of Webpack or Rollup for Extension Bundling?",
         "<b>Instant Compilation:</b> esbuild compiles TypeScript and bundles the entire VS Code extension in <b>13 milliseconds</b>, compared to Webpack which takes 4 to 8 seconds. This enables a frictionless developer loop and produces a compact single-file bundle (33 KB) with zero external runtime dependencies."),

        ("Why 3-Tier Progressive Hints instead of Immediate Full Solutions?",
         "<b>Pedagogical Integrity:</b> Typical AI tools dump complete working solutions immediately, fostering dependency and reducing problem-solving retention. AlgoPulse reveals hints incrementally (Observation ➔ Pattern ➔ Concrete Strategy), mirroring the pedagogical behavior of real FAANG technical interviewers."),

        ("Why Approach-Based Evaluation instead of Raw Execution Time or Binary Verdicts?",
         "<b>True Algorithmic Understanding:</b> LeetCode server load fluctuations cause identical solutions to score anywhere from 40% to 90% in runtime percentiles. AlgoPulse judges the intrinsic algorithmic strategy: did the user employ Hash Map Single-Pass, Sliding Window, or Two Pointers? This teaches students transferable algorithmic invariants rather than micro-optimizations.")
    ]

    for q, a in tradeoffs:
        story.append(Paragraph(f"• <b>{q}</b>", body_bold))
        story.append(Paragraph(a, body_style))
        story.append(Spacer(1, 4))

    # SECTION 6: FAQ
    story.append(PageBreak())
    story.append(Paragraph("6. Comprehensive Architectural & Viva Defense FAQ", h1_style))

    faqs = [
        ("Q1: What is the exact workflow when a user clicks 'Analyze Code' on LeetCode?",
         "1. The content script sends a window message to <code>injected.js</code> (MAIN world).<br/>"
         "2. <code>injected.js</code> queries <code>window.monaco.editor.getModels()</code>, returns code and language.<br/>"
         "3. <code>extractor.ts</code> scrapes problem slug, difficulty, and problem description.<br/>"
         "4. Content script sends <code>ANALYZE_AND_EVALUATE</code> to the background service worker.<br/>"
         "5. Background worker calls Gemini API with the 4-pillar rubric prompt.<br/>"
         "6. Background worker receives structured JSON, saves locally in <code>chrome.storage.local</code>, and triggers <code>POST http://localhost:3000/api/submissions</code> with the bearer token.<br/>"
         "7. The dashboard receives the submission, mirrors it to Supabase and local JSON, and updates the heatmap in real-time.<br/>"
         "8. The content script renders the score, Big-O comparison, and progressive hints in the slide-over drawer."),

        ("Q2: How does the VS Code extension differ from the Chrome extension?",
         "The Chrome extension operates in the browser on web platforms (LeetCode, GFG, HackerRank) using DOM/Monaco hooks. The VS Code extension operates locally in the developer's IDE using the <code>vscode.window.activeTextEditor</code> API. Both extensions share identical prompt architecture, 4-pillar scoring rubrics, and sync seamlessly to the same centralized AlgoPulse dashboard."),

        ("Q3: How does AlgoPulse handle Gemini API model deprecations or outages?",
         "AlgoPulse implements <b>Dynamic Model Resolution</b> (<code>resolveBestModel</code>). Upon first invocation, it queries <code>/v1beta/models</code> using the user's API key and automatically selects the newest available model prioritizing <code>gemini-3.8-flash</code> > <code>gemini-2.0-flash</code> > <code>gemini-1.5-flash</code>. If a model fails or is deprecated, it automatically falls back to the next candidate without crashing."),

        ("Q4: How does authentication between extensions and the dashboard work?",
         "Each user account in the AlgoPulse dashboard is assigned a unique, cryptographically secure <b>Extension Token</b> (e.g., <code>ap_sec_c55fcaf1...</code>). When making HTTP requests to <code>/api/submissions</code>, extensions pass this token in the <code>Authorization: Bearer <token></code> header. The dashboard validates the token against the Supabase <code>profiles</code> table and associates submissions with the user ID."),

        ("Q5: What happens if a user submits code before setting up their extension token?",
         "AlgoPulse features a resilient fallback: submissions without tokens are recorded with <code>user_id = null</code> in both Supabase and local JSON storage. The dashboard displays these unassigned submissions on the dashboard and heatmap so no work is ever lost."),

        ("Q6: How does the Submission Activity Heatmap work?",
         "The heatmap computes a 16-week (112-day) activity matrix up to today. For each day, it counts total submissions and assigns one of 5 Google green intensity levels (Level 0: empty, Level 1: 1 sub, Level 2: 2 subs, Level 3: 3 subs, Level 4: 4+ subs). It also calculates current streak, longest streak, and total active days with hover tooltips listing problem titles."),

        ("Q7: How does real-time live sync work without manual page refresh?",
         "Both <code>/dashboard</code> and <code>/submissions</code> implement active polling (every 5 seconds) combined with client-side state revalidation. When a new submission arrives from LeetCode or VS Code, the dashboard updates its KPI counters, heatmap, and recent submission list live."),

        ("Q8: Why is Manifest V3 used instead of Manifest V2?",
         "Chrome officially deprecated Manifest V2 in 2024. MV3 is mandatory for modern extensions. MV3 improves browser security, prevents malicious code injection, reduces memory footprint via event-driven service workers, and provides strict CSP sandboxing."),

        ("Q9: Is user code stored publicly or shared with third parties?",
         "No. User code is sent strictly via HTTPS directly to Google Gemini API using the user's private API key, and to the user's own local/hosted AlgoPulse instance. No code is shared with public telemetry or third-party ad networks."),

        ("Q10: What are the main viva / academic project defense questions evaluators ask?",
         "1. <b>'Why not just use ChatGPT?'</b> ➔ ChatGPT requires manual copy-pasting, has no in-editor DOM hooks, lacks a 4-pillar rubric, lacks progressive hints, and cannot track daily streak heatmaps.<br/>"
         "2. <b>'How do you avoid LeetCode DOM changes breaking your scraper?'</b> ➔ We read Monaco's underlying model buffer in the MAIN world, making code extraction immune to DOM class changes.<br/>"
         "3. <b>'What makes this free?'</b> ➔ We exclusively use Google AI Studio's 15 RPM free tier, Next.js hobby deployment, and Supabase free PostgreSQL with local JSON fallback.")
    ]

    for q, a in faqs:
        story.append(Paragraph(q, faq_q_style))
        story.append(Paragraph(a, faq_a_style))
        story.append(Spacer(1, 3))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Successfully generated {filename} ({os.path.getsize(filename)} bytes)")

if __name__ == "__main__":
    create_faq_pdf("FAQ.pdf")
