import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Initialize 16:9 Widescreen Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Clean Minimal White Theme Palette
BG_WHITE = RGBColor(255, 255, 255)      # #FFFFFF Pure White Background
CARD_BG = RGBColor(248, 250, 252)       # #F8FAFC Clean Light Surface
CARD_BORDER = RGBColor(203, 213, 225)   # #CBD5E1 Subtle Border
TEXT_DARK = RGBColor(15, 23, 42)        # #0F172A High-Contrast Dark Heading
TEXT_BODY = RGBColor(30, 41, 59)        # #1E293B Crisp Dark Body Text
TEXT_MUTED = RGBColor(71, 85, 105)      # #475569 Readable Subtitle Gray

# Clean Accent Colors
ACCENT_BLUE = RGBColor(37, 99, 235)     # #2563EB Blue
ACCENT_GREEN = RGBColor(5, 150, 105)    # #059669 Green
ACCENT_AMBER = RGBColor(217, 119, 6)    # #D97706 Amber
ACCENT_RED = RGBColor(220, 38, 38)      # #DC2626 Red

blank_layout = prs.slide_layouts[6]

def set_white_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_WHITE

def add_header(slide, step_tag, title_text, subtitle_text=None, tag_color=ACCENT_BLUE):
    # Top Step Tag
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8.0), Inches(0.35))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = step_tag.upper()
    p_tag.font.size = Pt(13)
    p_tag.font.bold = True
    p_tag.font.color.rgb = tag_color

    # Large Slide Title (32pt)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.7), Inches(0.7))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(32)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_DARK

    # Large Subtitle (16pt)
    if subtitle_text:
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.48), Inches(11.7), Inches(0.45))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.size = Pt(16)
        p_sub.font.color.rgb = TEXT_MUTED

    # Clean Divider Line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(2.02), Inches(11.73), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = CARD_BORDER
    line.line.fill.background()

def add_card(slide, left, top, width, height, title, items, accent_color=ACCENT_BLUE, body_size=16):
    # Rounded Card
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.adjustments[0] = 0.03
    shape.fill.solid()
    shape.fill.fore_color.rgb = CARD_BG
    shape.line.color.rgb = CARD_BORDER
    shape.line.width = Pt(1.2)

    # Top Accent Bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
    bar.fill.solid()
    bar.fill.fore_color.rgb = accent_color
    bar.line.fill.background()

    # Text Content Box
    tb = slide.shapes.add_textbox(left + Inches(0.32), top + Inches(0.28), width - Inches(0.64), height - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    # Large Card Title (21pt)
    p_title = tf.paragraphs[0]
    p_title.text = title
    p_title.font.size = Pt(21)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_DARK
    p_title.space_after = Pt(14)

    # Large, Easy-to-Read Bullets (16pt default)
    for item in items:
        p = tf.add_paragraph()
        if isinstance(item, tuple):
            lead, text = item
            run1 = p.add_run()
            run1.text = f"• {lead} "
            run1.font.bold = True
            run1.font.size = Pt(body_size)
            run1.font.color.rgb = accent_color

            run2 = p.add_run()
            run2.text = text
            run2.font.bold = False
            run2.font.size = Pt(body_size)
            run2.font.color.rgb = TEXT_BODY
        else:
            p.text = f"• {item}"
            p.font.size = Pt(body_size)
            p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(11)


# ==============================================================================
# SLIDE 1: The Title and Team
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_white_background(s1)

top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.75), Inches(1.8), Inches(0.09))
top_bar.fill.solid()
top_bar.fill.fore_color.rgb = ACCENT_BLUE
top_bar.line.fill.background()

s1_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.05), Inches(11.7), Inches(3.2))
tf1 = s1_box.text_frame
tf1.word_wrap = True
tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

p_tag = tf1.paragraphs[0]
p_tag.text = "AI CODE REVIEWER & SKILL INTELLIGENCE PLATFORM"
p_tag.font.size = Pt(14)
p_tag.font.bold = True
p_tag.font.color.rgb = ACCENT_BLUE
p_tag.space_after = Pt(10)

p_main = tf1.add_paragraph()
p_main.text = "AlgoPulse"
p_main.font.size = Pt(58)
p_main.font.bold = True
p_main.font.color.rgb = TEXT_DARK
p_main.space_after = Pt(8)

p_sub = tf1.add_paragraph()
p_sub.text = "Look Beyond 'Accepted': Evaluate Your Approach, Get Hints, and Never Forget"
p_sub.font.size = Pt(24)
p_sub.font.bold = True
p_sub.font.color.rgb = ACCENT_GREEN
p_sub.space_after = Pt(14)

p_desc = tf1.add_paragraph()
p_desc.text = "A unified coding mentor working directly inside Chrome (LeetCode, GFG, HackerRank), VS Code, and a live Next.js dashboard."
p_desc.font.size = Pt(17)
p_desc.font.color.rgb = TEXT_MUTED

add_card(s1, Inches(0.8), Inches(4.45), Inches(11.73), Inches(2.4),
         "Project Team & Guide Details", [
             ("Project Lead:", "Rohith Bheemini"),
             ("Team Members:", "[Member 2 Name & Roll No.]   •   [Member 3 Name & Roll No.]   •   [Member 4 Name & Roll No.]"),
             ("Project Guide:", "[Guide Name & Designation]   •   Department of Computer Science & Engineering")
         ], accent_color=ACCENT_BLUE, body_size=16)


# ==============================================================================
# SLIDE 2: The Problem Currently and How It Affects Us
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
set_white_background(s2)
add_header(s2, "Slide 2 • Problem Statement", "The Problem Currently & How It Affects Us",
           "Three major problems every student faces while practicing coding problems today.",
           tag_color=ACCENT_RED)

add_card(s2, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. The 'Accepted' Trap", [
             ("What Happens:", "Platforms like LeetCode only say 'Accepted' or 'Wrong Answer'."),
             ("The Hidden Flaw:", "Slow brute-force code (O(N²)) still passes when test cases are small."),
             ("How It Hurts Us:", "We think we mastered the problem, but get rejected in real interviews for slow code.")
         ], accent_color=ACCENT_RED, body_size=15.5)

add_card(s2, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. ChatGPT Spoils Answers", [
             ("What Happens:", "When stuck, students copy-paste their code into ChatGPT."),
             ("The Hidden Flaw:", "ChatGPT immediately gives the full working code instead of teaching."),
             ("How It Hurts Us:", "Spoiling the answer stops our brain from learning, and switching tabs breaks focus.")
         ], accent_color=ACCENT_AMBER, body_size=15.5)

add_card(s2, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. We Forget What We Solve", [
             ("What Happens:", "We solve 100 problems this month and move on."),
             ("The Hidden Flaw:", "No coding site tracks memory loss or tells us when to revise."),
             ("How It Hurts Us:", "Two months later in the interview room, we forget the exact pattern we practiced.")
         ], accent_color=ACCENT_BLUE, body_size=15.5)


# ==============================================================================
# SLIDE 3: The Research We Have Done to Solve This Problem
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
set_white_background(s3)
add_header(s3, "Slide 3 • Literature Review (2024–2026)", "The Research We Have Done to Solve This Problem",
           "Verified 2024–2026 research papers that proved these gaps and guided our solution.",
           tag_color=ACCENT_BLUE)

add_card(s3, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. Code Efficiency Gaps", [
             ("Papers (2024–2026):", "EffiBench (NeurIPS 2024), BigO(Bench) (2025), & Khan et al. (2026)."),
             ("What They Found:", "Passed LeetCode code is often 13x slower and uses 43x more memory than optimal code."),
             ("How We Solved It:", "We built a 4-Pillar Score (0–100) that grades Approach, Time, Space, and Code Style.")
         ], accent_color=ACCENT_RED, body_size=15)

add_card(s3, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. Socratic Hints vs. Spoiling", [
             ("Papers (2024–2025):", "CodeAid (ACM CHI 2024) & Al-Hossami et al. (ACM SIGCSE 2024 / 2025)."),
             ("What They Found:", "700-student study showed direct AI answers harm learning; step-by-step hints work best."),
             ("How We Solved It:", "We built 3-Step Progressive Hints that guide your thinking without giving away code.")
         ], accent_color=ACCENT_AMBER, body_size=15)

add_card(s3, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. In-Editor Flow & Memory", [
             ("Papers (2024–2026):", "Nam et al. (ICSE 2024), Pantelaios (NDSS 2024), LECTOR (2025), & Schill (2026)."),
             ("What They Found:", "In-editor tools save time, and grouping problems by concept prevents forgetting."),
             ("How We Solved It:", "Chrome & VS Code extensions synced to a 14-Pattern Spaced Repetition Reminder.")
         ], accent_color=ACCENT_GREEN, body_size=15)


# ==============================================================================
# SLIDE 4: The Workflow and Implementation We Have Taken
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
set_white_background(s4)
add_header(s4, "Slide 4 • Our Solution & Implementation", "The Implementation We Have Built",
           "Three core components working together to coach developers in real time.",
           tag_color=ACCENT_GREEN)

add_card(s4, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. Chrome & VS Code Extensions", [
             ("Browser Extension:", "Works directly on LeetCode, GeeksforGeeks, and HackerRank with 1 click."),
             ("VS Code Extension:", "Press Ctrl+Alt+A to review local Python, C++, Java, or JS files."),
             ("Zero Copy-Paste:", "Reads your code automatically and opens a clean side panel.")
         ], accent_color=ACCENT_BLUE, body_size=15.5)

add_card(s4, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. 4-Pillar Score & 3-Step Hints", [
             ("100-Point Score:", "35 pts Approach + 25 pts Time + 20 pts Space + 20 pts Clean Code."),
             ("3-Step Hints:", "Hint 1 (Clue) -> Hint 2 (Data Structure) -> Hint 3 (Logic Steps)."),
             ("Interview Curveballs:", "Asks senior follow-up questions like 'What if input size is 10¹²?'")
         ], accent_color=ACCENT_GREEN, body_size=15.5)

add_card(s4, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. Smart Revision Dashboard", [
             ("16-Week Heatmap:", "Tracks daily coding streaks across all 4 platforms in one place."),
             ("14 Coding Patterns:", "Shows your strong and weak topics (Two Pointers, DP, Graphs)."),
             ("Forgetting Alerts:", "Reminds you to revise old problems right before you forget them.")
         ], accent_color=ACCENT_AMBER, body_size=15.5)


# ==============================================================================
# SLIDE 5: The Architecture (Heading Only — Blank Space for Image Paste)
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
set_white_background(s5)
add_header(s5, "Slide 5 • System Architecture", "System Architecture",
           "How Web Coding Platforms, VS Code, Google Gemini AI, and the Next.js Dashboard connect.",
           tag_color=ACCENT_BLUE)
# Left open below the header so you can paste your architecture diagram image directly.


# ==============================================================================
# SLIDE 6: Tech Stack Explanation
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
set_white_background(s6)
add_header(s6, "Slide 6 • Technology Stack", "Tech Stack Explanation (100% Free Tools)",
           "Simple, fast, and 100% free technologies so any student can use it at zero cost.",
           tag_color=ACCENT_BLUE)

add_card(s6, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. Extensions (Front-End)", [
             ("Chrome Manifest V3:", "Latest secure Chrome standard; reads code from LeetCode & GFG editors."),
             ("VS Code Extension API:", "Built with TypeScript & esbuild into a tiny 33 KB package."),
             ("Shadow DOM UI:", "Keeps our review panel clean without breaking the website's layout.")
         ], accent_color=ACCENT_BLUE, body_size=15.5)

add_card(s6, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. AI Brain (Evaluation)", [
             ("Google Gemini Flash API:", "100% free tier via Google AI Studio; reviews code in under 2 seconds."),
             ("Auto-Model Switcher:", "Automatically picks the fastest working Gemini Flash model."),
             ("Zero Laptop Load:", "Runs in the cloud—no heavy GPU or RAM needed on student laptops.")
         ], accent_color=ACCENT_GREEN, body_size=15.5)

add_card(s6, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. Dashboard & Database", [
             ("Next.js 14 & Tailwind CSS:", "Powers both the web dashboard and backend API routes."),
             ("Supabase PostgreSQL:", "Free cloud database that securely stores each user's progress."),
             ("Local JSON Backup:", "Saves a local copy on disk so the dashboard works even without internet.")
         ], accent_color=ACCENT_AMBER, body_size=15.5)


# ==============================================================================
# SLIDE 7: The Workflow
# ==============================================================================
s7 = prs.slides.add_slide(blank_layout)
set_white_background(s7)
add_header(s7, "Slide 7 • Step-by-Step Workflow", "How the Complete Workflow Operates",
           "Four simple steps from writing code to tracking long-term mastery.",
           tag_color=ACCENT_GREEN)

add_card(s7, Inches(0.8), Inches(2.25), Inches(2.75), Inches(4.7),
         "Step 1: Write Code", [
             ("On Web:", "Click 'Analyze Code' on LeetCode or GFG."),
             ("On Desktop:", "Press Ctrl+Alt+A in VS Code."),
             ("Auto-Read:", "Extension grabs your code and problem title.")
         ], accent_color=ACCENT_BLUE, body_size=15)

add_card(s7, Inches(3.79), Inches(2.25), Inches(2.75), Inches(4.7),
         "Step 2: AI Review", [
             ("Fast Check:", "Sent securely to Google Gemini Flash."),
             ("Score (0–100):", "Grades Approach, Time, Space, and Style."),
             ("Big-O Check:", "Compares your speed vs. best speed.")
         ], accent_color=ACCENT_GREEN, body_size=15)

add_card(s7, Inches(6.78), Inches(2.25), Inches(2.75), Inches(4.7),
         "Step 3: Learn & Fix", [
             ("Side Panel:", "See exact bottlenecks right next to your code."),
             ("3-Step Hints:", "Unlock hints one by one without spoilers."),
             ("1-Click Insert:", "Insert optimal reference code when done.")
         ], accent_color=ACCENT_AMBER, body_size=15)

add_card(s7, Inches(9.77), Inches(2.25), Inches(2.75), Inches(4.7),
         "Step 4: Live Sync", [
             ("Auto-Save:", "Sent to Next.js API and Supabase DB."),
             ("Live Update:", "Dashboard updates in 5 seconds automatically."),
             ("Revision Queue:", "Schedules your next revision date.")
         ], accent_color=ACCENT_RED, body_size=15)


# ==============================================================================
# SLIDE 8: The Limitations
# ==============================================================================
s8 = prs.slides.add_slide(blank_layout)
set_white_background(s8)
add_header(s8, "Slide 8 • Current Limitations", "Current Limitations of the System",
           "Honest technical constraints of our current version and how we handle them.",
           tag_color=ACCENT_RED)

add_card(s8, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. Free API Speed Limit", [
             ("The Limit:", "Google's free Gemini API allows 15 requests per minute per key."),
             ("When It Matters:", "If 50 students use the exact same API key at once, it will slow down."),
             ("How We Handle It:", "Each student enters their own free personal API key in settings.")
         ], accent_color=ACCENT_RED, body_size=15.5)

add_card(s8, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. Internet Needed for AI", [
             ("The Limit:", "Generating a new AI code review requires an active internet connection."),
             ("When It Matters:", "In offline college exam halls without internet, live AI calls cannot run."),
             ("How We Handle It:", "The dashboard and past saved reviews still work 100% offline via Local JSON.")
         ], accent_color=ACCENT_AMBER, body_size=15.5)

add_card(s8, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. Website Layout Updates", [
             ("The Limit:", "Reading problem titles and difficulty relies on webpage layout tags."),
             ("When It Matters:", "If LeetCode redesigns its webpage, title detection may need an update."),
             ("How We Handle It:", "We backup-read the problem name directly from the page URL.")
         ], accent_color=ACCENT_BLUE, body_size=15.5)


# ==============================================================================
# SLIDE 9: The Future Scope
# ==============================================================================
s9 = prs.slides.add_slide(blank_layout)
set_white_background(s9)
add_header(s9, "Slide 9 • Future Scope", "Future Scope & Next Phase Upgrades",
           "Upcoming features to turn AlgoPulse into a complete career and classroom platform.",
           tag_color=ACCENT_GREEN)

add_card(s9, Inches(0.8), Inches(2.25), Inches(3.65), Inches(4.7),
         "1. Auto-Push Code to GitHub", [
             ("GitHub Code Insertion:", "Automatically pushes your best solved code to your GitHub repo in 1 click."),
             ("Auto-README Badges:", "Creates a clean README with your 4-Pillar Score and Big-O stats."),
             ("GitHub PR Checker:", "Bot that checks team Pull Requests for slow O(N²) loops.")
         ], accent_color=ACCENT_GREEN, body_size=15.5)

add_card(s9, Inches(4.84), Inches(2.25), Inches(3.65), Inches(4.7),
         "2. Voice AI & Visual Animations", [
             ("Voice Mock Interviewer:", "Talk aloud to an AI interviewer that asks follow-up questions in real time."),
             ("Visual Step-by-Step:", "Animated arrows showing how Two Pointers and Sliding Windows move."),
             ("More Coding Sites:", "Adding support for Codeforces, AtCoder, and CodeChef.")
         ], accent_color=ACCENT_BLUE, body_size=15.5)

add_card(s9, Inches(8.88), Inches(2.25), Inches(3.65), Inches(4.7),
         "3. College & Offline AI Mode", [
             ("Teacher / TA Dashboard:", "Lets professors see which coding topics the whole class is struggling with."),
             ("Copy-Paste Detection:", "Checks typing patterns to ensure students write code themselves."),
             ("100% Offline AI (Ollama):", "Runs a small local AI model on lab PCs without needing internet.")
         ], accent_color=ACCENT_AMBER, body_size=15.5)


# ==============================================================================
# SLIDE 10: Thank You
# ==============================================================================
s10 = prs.slides.add_slide(blank_layout)
set_white_background(s10)

thank_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.6), Inches(1.35), Inches(10.13), Inches(4.8))
thank_card.adjustments[0] = 0.03
thank_card.fill.solid()
thank_card.fill.fore_color.rgb = CARD_BG
thank_card.line.color.rgb = CARD_BORDER
thank_card.line.width = Pt(1.5)

thank_bar = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.6), Inches(1.35), Inches(10.13), Inches(0.09))
thank_bar.fill.solid()
thank_bar.fill.fore_color.rgb = ACCENT_BLUE
thank_bar.line.fill.background()

tb10 = s10.shapes.add_textbox(Inches(2.1), Inches(1.95), Inches(9.13), Inches(3.7))
tf10 = tb10.text_frame
tf10.word_wrap = True

p10_tag = tf10.paragraphs[0]
p10_tag.text = "ALGOPULSE — AI CODE REVIEWER & SKILL INTELLIGENCE"
p10_tag.font.size = Pt(14)
p10_tag.font.bold = True
p10_tag.font.color.rgb = ACCENT_BLUE
p10_tag.alignment = PP_ALIGN.CENTER
p10_tag.space_after = Pt(14)

p10_main = tf10.add_paragraph()
p10_main.text = "Thank You!"
p10_main.font.size = Pt(56)
p10_main.font.bold = True
p10_main.font.color.rgb = TEXT_DARK
p10_main.alignment = PP_ALIGN.CENTER
p10_main.space_after = Pt(14)

p10_sub = tf10.add_paragraph()
p10_sub.text = "We Welcome Your Questions & Live Demo Requests"
p10_sub.font.size = Pt(22)
p10_sub.font.bold = True
p10_sub.font.color.rgb = ACCENT_GREEN
p10_sub.alignment = PP_ALIGN.CENTER
p10_sub.space_after = Pt(24)

p10_links = tf10.add_paragraph()
p10_links.text = "Chrome Extension  •  VS Code Extension  •  Web Dashboard (http://localhost:3000)"
p10_links.font.size = Pt(16)
p10_links.font.color.rgb = TEXT_MUTED
p10_links.alignment = PP_ALIGN.CENTER

# Save to both PPT_AlogPulse.pptx and Pitch_AlgoPulse.pptx
for filename in ["PPT_AlogPulse.pptx", "Pitch_AlgoPulse.pptx"]:
    out = os.path.abspath(filename)
    prs.save(out)
    print(f"SUCCESS: Saved 10-slide white-theme presentation to: {out}")
