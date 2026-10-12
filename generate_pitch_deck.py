import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Initialize 16:9 Widescreen Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Design Palette
BG_COLOR = RGBColor(13, 17, 23)         # #0D1117 Deep GitHub/VS Dark
CARD_BG = RGBColor(22, 27, 34)          # #161B22 Elevated Card
CARD_BORDER = RGBColor(48, 54, 61)      # #30363D Border
TEXT_LIGHT = RGBColor(240, 246, 252)    # #F0F6FC Primary Crisp Text
TEXT_MUTED = RGBColor(139, 148, 158)    # #8B949E Secondary Subtext
ACCENT_BLUE = RGBColor(66, 133, 244)    # #4285F4 Google Blue
ACCENT_GREEN = RGBColor(52, 168, 83)    # #34A853 Google Green
ACCENT_YELLOW = RGBColor(251, 188, 5)   # #FBBC05 Google Yellow
ACCENT_RED = RGBColor(234, 67, 53)      # #EA4335 Google Red
CARD_HOVER = RGBColor(30, 41, 59)       # #1E293B

blank_layout = prs.slide_layouts[6]

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_header(slide, category_tag, title_text, subtitle_text=None, tag_color=ACCENT_BLUE):
    # Category Pill
    tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(4.5), Inches(0.4))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = category_tag.upper()
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = tag_color

    # Main Title (Bigger font for high readability)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_LIGHT

    # Subtitle if present
    if subtitle_text:
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.65), Inches(11.7), Inches(0.45))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.size = Pt(14)
        p_sub.font.color.rgb = TEXT_MUTED

def add_card(slide, left, top, width, height, title, items, badge_text=None, accent_color=ACCENT_BLUE):
    # Rounded Card Shape
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = CARD_BG
    shape.line.color.rgb = CARD_BORDER
    shape.line.width = Pt(1.2)

    # Accent top border indicator line
    accent_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.08))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = accent_color
    accent_bar.line.fill.background()

    # Content Box inside Card
    tb = slide.shapes.add_textbox(left + Inches(0.35), top + Inches(0.3), width - Inches(0.7), height - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    # Card Title
    p_title = tf.paragraphs[0]
    p_title.text = title
    p_title.font.size = Pt(19)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_LIGHT
    p_title.space_after = Pt(12)

    # Bullets / Details
    for idx, item in enumerate(items):
        p = tf.add_paragraph()
        if isinstance(item, tuple):
            lead, text = item
            run1 = p.add_run()
            run1.text = f"{lead} "
            run1.font.bold = True
            run1.font.size = Pt(14)
            run1.font.color.rgb = accent_color

            run2 = p.add_run()
            run2.text = text
            run2.font.bold = False
            run2.font.size = Pt(14)
            run2.font.color.rgb = TEXT_LIGHT
        else:
            p.text = f"• {item}"
            p.font.size = Pt(14)
            p.font.color.rgb = TEXT_LIGHT
        
        p.space_after = Pt(8)

# ==============================================================================
# SLIDE 1: Title & Pitch Hook
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1)

# Large Center Visual Box
s1_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(4.5))
tf1 = s1_box.text_frame
tf1.word_wrap = True
tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

p_pre = tf1.paragraphs[0]
p_pre.text = "⚡ NEXT-GEN DEVELOPER PEDAGOGY & SKILL INTELLIGENCE"
p_pre.font.size = Pt(13)
p_pre.font.bold = True
p_pre.font.color.rgb = ACCENT_BLUE
p_pre.space_after = Pt(14)

p_hero = tf1.add_paragraph()
p_hero.text = "AlgoPulse"
p_hero.font.size = Pt(54)
p_hero.font.bold = True
p_hero.font.color.rgb = TEXT_LIGHT
p_hero.space_after = Pt(12)

p_tagline = tf1.add_paragraph()
p_tagline.text = "Beyond the Binary Verdict: Real-Time Algorithmic Code Review & Career Readiness"
p_tagline.font.size = Pt(22)
p_tagline.font.color.rgb = ACCENT_GREEN
p_tagline.space_after = Pt(24)

p_pitch = tf1.add_paragraph()
p_pitch.text = "A multi-platform developer ecosystem uniting Chrome, VS Code, and Next.js to evaluate problem-solving approaches, uncover paradigm blind spots, and guarantee interview retention."
p_pitch.font.size = Pt(15)
p_pitch.font.color.rgb = TEXT_MUTED

# ==============================================================================
# SLIDE 2: How We Got This Idea (The Origin Story)
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
set_slide_background(s2)
add_header(s2, "The Origin Story", "How We Got This Idea: The 'Accepted' Trap", 
           "Every developer knows the relief of seeing green text on LeetCode. But is green code really good code?")

add_card(s2, Inches(0.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "The False Sense of Security", [
             ("The Trap:", "You write an O(N²) brute-force solution. The judge accepts it because the test inputs happen to be small."),
             ("The Illusion:", "You feel ready and confident because the platform gave you an 'Accepted' verdict."),
             ("The Reality:", "In a Tier-1 tech interview, passing tests is only step one. An O(N²) solution when O(N) exists is an instant rejection.")
         ], accent_color=ACCENT_RED)

add_card(s2, Inches(4.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "The Context-Switch Friction", [
             ("The Split:", "We practice algorithms in the web browser, but we build real software in VS Code."),
             ("The Disconnect:", "No existing tool connects your daily local engineering with your competitive programming streak."),
             ("The Pain:", "Your growth data is scattered across three platforms and lost in private scratchpad files.")
         ], accent_color=ACCENT_YELLOW)

add_card(s2, Inches(8.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "The Forgetting Curve", [
             ("The Reality:", "You solve 100 problems this month. Two months later, you can barely solve Two Sum."),
             ("The Cause:", "No platform models Ebbinghaus memory decay or reminds you before mental extinction occurs."),
             ("The Goal:", "We needed a personal AI senior engineer living in our workflow that coaches us continuously.")
         ], accent_color=ACCENT_BLUE)

# ==============================================================================
# SLIDE 3: Why This Approach vs. Alternatives
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
set_slide_background(s3)
add_header(s3, "Market Gap Analysis", "Why This Approach? (And Why Not The Others?)", 
           "Existing alternatives either grade blindly, spoil the answer, or miss algorithmic semantics.")

add_card(s3, Inches(0.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Traditional Judges (LeetCode/GFG)", [
             ("Limitation 1:", "Binary verdict only (Pass vs. Fail). Zero feedback on algorithmic style or invariants."),
             ("Limitation 2:", "Server CPU noise causes 40ms vs. 80ms runtime swings for identical code."),
             ("Limitation 3:", "Does not tell you if you used the right mental model or if your memory was wasteful.")
         ], accent_color=ACCENT_RED)

add_card(s3, Inches(4.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Raw ChatGPT / Chat LLMs", [
             ("Limitation 1:", "Spoils the answer immediately, completely destroying the learning and recall struggle."),
             ("Limitation 2:", "High context friction: requires copy-pasting code, problem descriptions, and constraints."),
             ("Limitation 3:", "No persistent tracking: does not remember your streaks, paradigms, or weak spots.")
         ], accent_color=ACCENT_YELLOW)

add_card(s3, Inches(8.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "AlgoPulse: The In-Flow Mentor", [
             ("In-Editor Flow:", "Reviews code directly in LeetCode, GFG, HackerRank, and VS Code with 1 click."),
             ("4-Pillar Model:", "Scores Optimality, Time, Space, and Cleanliness on a calibrated 100-point rubric."),
             ("Pedagogical Hints:", "3 progressive tiers nudge your thinking without ever spoiling code.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 4: How It Helps in Everyday Tasks
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
set_slide_background(s4)
add_header(s4, "Everyday Value", "How AlgoPulse Transforms Everyday Workflows", 
           "Designed for daily use by working engineers, college students, and technical interview candidates.")

add_card(s4, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "1. Daily Problem Solving & Interview Prep", [
             ("Zero Context-Switching:", "Click 'Analyze Code' directly on LeetCode or press Ctrl+Alt+A in VS Code. Never leave your editor."),
             ("Immediate Pedagogical Hints:", "Stuck on a tricky problem? Reveal Tier 1 (an invariant nudge) or Tier 2 (a pattern nudge) without giving away the solution."),
             ("Memory Decay Protection:", "The dashboard automatically alerts you when high-yield patterns are about to fade from memory.")
         ], accent_color=ACCENT_BLUE)

add_card(s4, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "2. Real-World Engineering & Clean Code", [
             ("Space & Time Consciousness:", "Highlights hidden O(N) memory allocations (like string slicing or unneeded hash tables) before code hits production."),
             ("Senior Interview Preparation:", "Generates real follow-up questions: 'What if N = 10¹²?' or 'Can you solve this with O(1) space?'"),
             ("Verified Proof of Consistency:", "Share a public authenticated transcript with engineering recruiters showing real streaks and paradigm mastery.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 5: System Architecture & Data Pipeline
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
set_slide_background(s5)
add_header(s5, "Architecture", "System Architecture & Live Data Flow", 
           "High-performance client extensions communicating with a zero-cost AI engine and reactive web dashboard.")

add_card(s5, Inches(0.8), Inches(2.2), Inches(2.7), Inches(4.7), 
         "Client Layer", [
             ("Chrome Ext (MV3):", "Injects into Monaco (LeetCode), Ace (GFG), & CodeMirror (HackerRank)."),
             ("VS Code Ext:", "TypeScript extension using active TextEditor buffer and Webview panel."),
             ("Zero Friction:", "Native hotkeys and slide-over panels.")
         ], accent_color=ACCENT_BLUE)

add_card(s5, Inches(3.8), Inches(2.2), Inches(2.7), Inches(4.7), 
         "AI Engine", [
             ("Google Gemini API:", "Dynamic model discovery via Google ModelService.ListModels API (3.7/3.6/3.8 Flash)."),
             ("Zero Hardcoding:", "Auto-detects live supported models with fallback resilience."),
             ("Zero Latency:", "Sub-2-second evaluation turnaround with strict JSON formatting.")
         ], accent_color=ACCENT_YELLOW)

add_card(s5, Inches(6.8), Inches(2.2), Inches(2.7), Inches(4.7), 
         "Web Dashboard", [
             ("Next.js 14 App:", "React 18, Tailwind CSS, and GitHub dark styling."),
             ("Dynamic Theme:", "Google 4-color ambient glowing lighting."),
             ("Live Polling:", "5-second non-intrusive sync with live activity badges.")
         ], accent_color=ACCENT_GREEN)

add_card(s5, Inches(9.8), Inches(2.2), Inches(2.7), Inches(4.7), 
         "Hybrid Storage", [
             ("Supabase DB:", "PostgreSQL database with Row Level Security."),
             ("Local Mirroring:", "Automatic JSON fallback for 100% offline functionality."),
             ("Token Security:", "Secure Bearer extension tokens.")
         ], accent_color=ACCENT_RED)

# ==============================================================================
# SLIDE 6: Implementation Depth - Editor Hooks & Manifest V3
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
set_slide_background(s6)
add_header(s6, "Engineering Depth", "In-Depth Implementation: Editor AST & Runtime Hooks", 
           "How we extracted editor code safely across three competitive programming platforms and desktop IDEs.")

add_card(s6, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "Overcoming Browser Sandbox Isolation", [
             ("The Challenge:", "Modern web platforms isolate editor state inside window objects unreachable by standard content scripts."),
             ("Monaco Hook (LeetCode):", "We inject an in-page runtime bridge directly into window.monaco.editor.getModels() to read exact buffer AST without relying on fragile DOM scraping."),
             ("Ace & CodeMirror:", "Custom bridge hooks attach directly to window.ace and CodeMirror editor instances on GeeksforGeeks and HackerRank."),
             ("Shadow DOM Slide-Over:", "Review drawer renders inside an isolated Shadow DOM container, guaranteeing zero CSS collisions with host websites.")
         ], accent_color=ACCENT_BLUE)

add_card(s6, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "VS Code Extension Architecture", [
             ("Native Editor Access:", "Captures active selection or entire document via vscode.window.activeTextEditor in real time."),
             ("Interactive Webview:", "Renders an embedded dark-themed UI panel in the VS Code Activity Bar with live hint reveal toggles."),
             ("One-Click Code Insertion:", "Includes an 'Insert in Editor' command that replaces the user buffer with optimal reference code on request."),
             ("Universal Language Support:", "Accurately parses Python, Java, C++, TypeScript, Go, and Rust problem statements and code.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 7: The 4-Pillar Evaluation & Pedagogical Hint Engine
# ==============================================================================
s7 = prs.slides.add_slide(blank_layout)
set_slide_background(s7)
add_header(s7, "Pedagogical Model", "The 4-Pillar Algorithmic Rubric & Hint Engine", 
           "Moving away from simplistic execution time to holistic algorithmic craftsmanship.")

add_card(s7, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "The Calibrated 100-Point Rubric", [
             ("🧠 Algorithmic Optimality (35 pts):", "Evaluates whether you selected the mathematically optimal paradigm (e.g. Hash Map vs. Sorting vs. Dynamic Programming)."),
             ("⏱️ Time Complexity (25 pts):", "Calculates Big-O distance between your approach and the theoretical lower bound."),
             ("💾 Space Complexity (20 pts):", "Evaluates auxiliary heap and stack allocations vs. in-place pointer mutations."),
             ("🧹 Cleanliness & Edge Cases (20 pts):", "Checks variable naming, guard clauses, empty inputs, single elements, and integer overflow handling.")
         ], accent_color=ACCENT_BLUE)

add_card(s7, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "3-Tier Socratic Progressive Hints", [
             ("Tier 1 - Structural Invariant:", "Gives a subtle nudge without naming algorithms. Example: 'Notice that elements are already sorted in ascending order.'"),
             ("Tier 2 - Pattern Suggestion:", "Suggests the applicable data structure or mental model. Example: 'Consider using a two-pointer inward scan from both ends.'"),
             ("Tier 3 - Concrete Blueprint:", "Explains the exact state transitions step-by-step without giving away code, preserving the 'Aha!' moment for the student.")
         ], accent_color=ACCENT_YELLOW)

# ==============================================================================
# SLIDE 8: 14-Paradigm Competency Matrix & Spaced Repetition
# ==============================================================================
s8 = prs.slides.add_slide(blank_layout)
set_slide_background(s8)
add_header(s8, "Skill Intelligence", "14-Paradigm Competency Matrix & Forgetting Curve", 
           "Going beyond generic tags like 'Array' to diagnose exact algorithmic mental models.")

add_card(s8, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "14 Foundational Interview Archetypes", [
             ("Diagnostic Mapping:", "Tracks Two Pointers, Sliding Window, Monotonic Stack, In-place Reversal, Fast & Slow Pointers, Two Heaps, Subsets, Binary Search, Top K, Knapsack, and Graph BFS/DFS."),
             ("Blind-Spot Detection:", "Identifies patterns where your scores drop below 60% or patterns you haven't touched in weeks."),
             ("Readiness Gauge (0-100%):", "Computes an empirical FAANG/Tier-1 interview readiness index updated with every submission.")
         ], accent_color=ACCENT_BLUE)

add_card(s8, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "Ebbinghaus Spaced Repetition Engine", [
             ("The Decay Formula:", "Decay % = min(100, Days Elapsed × 16 - Score Bonus). Models how fast memories fade without deliberate recall."),
             ("Urgency Tiers:", "Automatically classifies solved problems into: Due Today (≥65% decay), Upcoming (30-64%), and Mastered (<30%)."),
             ("Targeted Repetition:", "Prompts you to re-solve key patterns right before memory extinction occurs, locking concepts into long-term memory.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 9: Senior Interview Curveballs & Public Portfolio
# ==============================================================================
s9 = prs.slides.add_slide(blank_layout)
set_slide_background(s9)
add_header(s9, "Advanced Features", "Senior Follow-Up Curveballs & Verified Portfolio", 
           "Preparing candidates for real senior interview scenarios and showcasing verifiable proof of competency.")

add_card(s9, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "Senior Interviewer Follow-Up Curveballs", [
             ("Beyond Simple Code:", "In real senior interviews, passing the problem is only step one. Interviewers immediately throw scale and constraint curveballs."),
             ("Scale Variations:", "'What if the dataset contains 10¹² elements and exceeds single-machine RAM?' -> Explores distributed sharding and disk streams."),
             ("Constraint Inversions:", "'Can you solve this with strict O(1) space without modifying the input array?' -> Explores bit manipulation and cycles."),
             ("Interactive Model Answers:", "Includes collapsible senior engineering reference architectures for every challenge.")
         ], accent_color=ACCENT_RED)

add_card(s9, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "Cryptographic / Public Verified Transcript (/verify)", [
             ("Zero Token Exposure:", "Generates a clean public proof-of-work transcript that developers can link on resumes and LinkedIn without exposing secret tokens."),
             ("Verifiable Metrics:", "Displays 16-week activity heatmap, interview readiness score, and paradigm competencies."),
             ("Recruiter Confidence:", "Gives hiring managers and bootcamp mentors authentic proof of consistent problem-solving.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 10: Complete Live Demo Walkthrough
# ==============================================================================
s10 = prs.slides.add_slide(blank_layout)
set_slide_background(s10)
add_header(s10, "Live Demonstration", "The Complete 3-Minute Live Demo Structure", 
           "A flawless sequence to showcase the entire platform during tomorrow's presentation.")

add_card(s10, Inches(0.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Step 1: The Browser Extension", [
             ("Open LeetCode/GFG:", "Navigate to Kadane's Algorithm on GFG or Two Sum on LeetCode."),
             ("In-Page Widget:", "Show the floating AlgoPulse badge and click 'Analyze Code'."),
             ("4-Pillar Feedback:", "Walk through the Optimality, Time, Space, and Cleanliness scores."),
             ("Progressive Hints:", "Click 'Reveal Tier 1 Observation' to show Socratic coaching.")
         ], accent_color=ACCENT_BLUE)

add_card(s10, Inches(4.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Step 2: The VS Code Extension", [
             ("Open VS Code:", "Show local editor with a solution file (solution.py)."),
             ("Run Hotkey:", "Press Ctrl+Alt+A or click 'AlgoPulse' in the Activity Bar."),
             ("Instant Analysis:", "Highlight how the same 4-pillar review appears inside the desktop IDE."),
             ("Insert Reference Code:", "Demonstrate 1-click insertion of optimal code.")
         ], accent_color=ACCENT_YELLOW)

add_card(s10, Inches(8.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Step 3: Web Dashboard Sync", [
             ("Switch to Dashboard:", "Open http://localhost:3000/dashboard."),
             ("User Isolation:", "Authenticated personal dashboard — zero mock data for new users."),
             ("14-Paradigm Radar:", "Show dynamic paradigm counts and interview readiness score."),
             ("Public Transcript:", "Click 'Verify' to show the shareable recruiter transcript.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 11: Real-World Impact & 100% Free Stack
# ==============================================================================
s11 = prs.slides.add_slide(blank_layout)
set_slide_background(s11)
add_header(s11, "Feasibility & Cost", "100% Free-Tier Architecture & Scalability", 
           "Engineered from day one to operate with zero infrastructure cost and infinite accessibility.")

add_card(s11, Inches(0.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "100% Free-Tier Technology Stack", [
             ("AI Intelligence:", "Google Gemini Flash API via dynamic ListModels discovery (Gemini 3.7/3.6/3.8 Flash)."),
             ("Web Application:", "Next.js 14 App Router deployed locally or on Vercel Hobby (100% free)."),
             ("Database Layer:", "Supabase PostgreSQL free tier (500MB) with offline local JSON mirroring."),
             ("Extensions:", "Chrome Manifest V3 and VS Code Ext API (distributed freely without app store fees).")
         ], accent_color=ACCENT_BLUE)

add_card(s11, Inches(6.8), Inches(2.2), Inches(5.6), Inches(4.7), 
         "Who Benefits from AlgoPulse?", [
             ("Individual Engineers:", "Saves hundreds of hours of directionless grinding and prevents memory loss."),
             ("Coding Bootcamps & Universities:", "Automates pedagogical TA reviews with progressive hint scaffolds."),
             ("Engineering Hiring:", "Replaces unreliable resume bullet points with verified 16-week proof-of-work portfolios.")
         ], accent_color=ACCENT_GREEN)

# ==============================================================================
# SLIDE 12: Conclusion & Summary
# ==============================================================================
s12 = prs.slides.add_slide(blank_layout)
set_slide_background(s12)
add_header(s12, "Summary", "Conclusion: Elevating Algorithmic Mastery", 
           "Turning algorithmic problem solving into a structured, delightful, and verifiable science.")

add_card(s12, Inches(0.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "The Shift in Thinking", [
             ("From:", "Passing test cases by accident and memorizing solutions."),
             ("To:", "Mastering 14 foundational mental models and understanding exact Big-O trade-offs."),
             ("Result:", "Confidence in any interview room, regardless of problem variations.")
         ], accent_color=ACCENT_BLUE)

add_card(s12, Inches(4.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "The Power of Workflow", [
             ("Seamless Flow:", "One unified ecosystem spanning Chrome, VS Code, and Next.js."),
             ("Continuous Recall:", "Spaced repetition ensures you never lose what you worked hard to learn."),
             ("No Friction:", "Instant evaluation in under 2 seconds.")
         ], accent_color=ACCENT_YELLOW)

add_card(s12, Inches(8.8), Inches(2.2), Inches(3.6), Inches(4.7), 
         "Ready Today", [
             ("Fully Built:", "Dual extensions, 15 Next.js routes, 4-pillar evaluation, and 19 verified API tests."),
             ("Production Verified:", "0 type errors, clean REST endpoints, and live syncing."),
             ("Try It Now:", "Open http://localhost:3000 to see AlgoPulse in action!")
         ], accent_color=ACCENT_GREEN)

# Save presentation
output_path = os.path.abspath("Pitch_AlgoPulse.pptx")
prs.save(output_path)
print(f"SUCCESS: Presentation successfully generated at: {output_path}")
