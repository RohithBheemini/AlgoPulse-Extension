import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

def build_architecture_diagram():
    # Set figure size and DPI for high resolution (3200 x 2000 px)
    fig_w, fig_h = 16, 10
    dpi = 200
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
    fig.patch.set_facecolor('#0d1117')
    ax.set_facecolor('#0d1117')
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Color definitions
    c_blue = '#4285F4'
    c_red = '#EA4335'
    c_yellow = '#FBBC05'
    c_green = '#34A853'
    c_card = '#161b22'
    c_subcard = '#21262d'
    c_border = '#30363d'
    c_text = '#f0f6fc'
    c_muted = '#8b949e'

    # Title Banner
    ax.text(8, 9.6, "AlgoPulse — Full System Architecture", 
            ha='center', va='center', fontsize=20, fontweight='bold', color=c_text)
    ax.text(8, 9.25, "Cross-Platform AI Algorithmic Review Ecosystem • Chrome MV3 • VS Code • Gemini 3.8 Flash • Next.js 14 • Supabase", 
            ha='center', va='center', fontsize=9.5, color=c_muted)

    # Google 4-color top accent bar
    ax.plot([0.5, 4.25], [9.05, 9.05], color=c_blue, lw=3)
    ax.plot([4.25, 8.0], [9.05, 9.05], color=c_red, lw=3)
    ax.plot([8.0, 11.75], [9.05, 9.05], color=c_yellow, lw=3)
    ax.plot([11.75, 15.5], [9.05, 9.05], color=c_green, lw=3)

    # Helper function to draw rounded container cards
    def draw_card(x, y, w, h, bg=c_card, border=c_border, lw=1.2, radius=0.15):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle=f"round,pad=0.04,rounding_size={radius}",
            facecolor=bg, edgecolor=border, linewidth=lw, zorder=2
        )
        ax.add_patch(rect)

    # Helper function for text boxes
    def draw_box(x, y, w, h, title, subtitle="", badge="", badge_color=c_blue, bg=c_subcard, border=c_border):
        draw_card(x, y, w, h, bg=bg, border=border, lw=1.0)
        # title
        ax.text(x + 0.12, y + h - 0.22, title, fontsize=8.5, fontweight='bold', color=c_text, zorder=5)
        # subtitle
        if subtitle:
            ax.text(x + 0.12, y + 0.16, subtitle, fontsize=7.2, color=c_muted, zorder=5)
        # badge
        if badge:
            ax.text(x + w - 0.12, y + h - 0.22, badge, fontsize=6.8, fontweight='bold', 
                    color=badge_color, ha='right', zorder=5)

    # ----------------- LAYER 1: DEVELOPER SURFACES (LEFT) -----------------
    draw_card(0.5, 0.6, 3.4, 8.15, bg=c_card, border=c_border)
    ax.text(0.7, 8.45, "1. DEVELOPER SURFACES", fontsize=11, fontweight='bold', color=c_yellow, zorder=5)
    ax.text(0.7, 8.22, "Competitive Coding & Local Editor", fontsize=7.5, color=c_muted, zorder=5)

    draw_box(0.7, 6.7, 3.0, 1.3, "LeetCode", "Monaco Editor Engine\nwindow.monaco.editor", "WEB", c_yellow)
    draw_box(0.7, 5.15, 3.0, 1.3, "GeeksforGeeks", "Ace Editor Practice Portal\nwindow.ace.edit()", "WEB", c_green)
    draw_box(0.7, 3.6, 3.0, 1.3, "HackerRank", "CodeMirror Buffer Context\n.CodeMirror-line DOM", "WEB", c_blue)
    draw_box(0.7, 1.0, 3.0, 2.3, "VS Code IDE (Local)", "ActiveTextEditor Buffer\nPython, C++, Java, JS/TS, Go\nCtrl+Alt+A Hotkey Trigger", "LOCAL", c_red)

    # ----------------- LAYER 2: EXTENSIONS & CLIENT RUNTIMES -----------------
    draw_card(4.2, 0.6, 3.5, 8.15, bg=c_card, border=c_border)
    ax.text(4.4, 8.45, "2. CLIENT RUNTIMES", fontsize=11, fontweight='bold', color=c_blue, zorder=5)
    ax.text(4.4, 8.22, "Browser MV3 & IDE Extension Host", fontsize=7.5, color=c_muted, zorder=5)

    # Chrome Extension subcontainer
    draw_card(4.4, 4.35, 3.1, 3.7, bg=c_subcard, border=c_blue, lw=1.2)
    ax.text(4.55, 7.75, "AlgoPulse Chrome Extension", fontsize=9, fontweight='bold', color=c_blue, zorder=5)
    ax.text(4.55, 7.55, "Manifest V3 Compliant Architecture", fontsize=7, color=c_muted, zorder=5)
    draw_box(4.55, 6.6, 2.8, 0.8, "injected.js", "Runs in MAIN World context", "BYPASS VIRTUAL DOM", c_yellow)
    draw_box(4.55, 5.65, 2.8, 0.8, "content.js", "Isolated World + Drawer UI", "DOM HOOKS", c_green)
    draw_box(4.55, 4.55, 2.8, 0.95, "background.js", "Ephemeral Service Worker\nGemini API & Dashboard Sync", "SERVICE WORKER", c_blue)

    # VS Code Extension subcontainer
    draw_card(4.4, 1.0, 3.1, 3.1, bg=c_subcard, border=c_red, lw=1.2)
    ax.text(4.55, 3.8, "AlgoPulse VS Code Extension", fontsize=9, fontweight='bold', color=c_red, zorder=5)
    ax.text(4.55, 3.6, "100% Free IDE Intelligence (.vsix)", fontsize=7, color=c_muted, zorder=5)
    draw_box(4.55, 2.7, 2.8, 0.78, "extension.ts", "Command router & status bar", "COMMANDS", c_red)
    draw_box(4.55, 1.8, 2.8, 0.78, "sidebarProvider.ts", "Activity Bar Webview panel", "WEBVIEW", c_yellow)
    draw_box(4.55, 1.15, 2.8, 0.55, "analyzer.ts + sync.ts", "Gemini HTTP + Dashboard sync", "ENGINE", c_green)

    # ----------------- LAYER 3: AI EVALUATION ENGINE (CENTER-RIGHT) -----------------
    draw_card(8.0, 0.6, 3.5, 8.15, bg=c_card, border=c_border)
    ax.text(8.2, 8.45, "3. AI EVALUATION ENGINE", fontsize=11, fontweight='bold', color=c_green, zorder=5)
    ax.text(8.2, 8.22, "Google Gemini 3.8 Flash • Free Tier", fontsize=7.5, color=c_muted, zorder=5)

    draw_box(8.2, 7.0, 3.1, 1.0, "Google AI Studio", "Zero-Cost Free API (15 RPM)\nDirect HTTPS /v1beta/models", "FREE TIER", c_green)
    
    # 4-Pillar Rubric Box
    draw_card(8.2, 3.8, 3.1, 3.0, bg=c_subcard, border=c_green, lw=1.2)
    ax.text(8.35, 6.5, "4-Pillar Algorithmic Rubric", fontsize=9, fontweight='bold', color=c_green, zorder=5)
    ax.text(8.35, 6.3, "Total Score: 0 to 100 Points", fontsize=7, color=c_muted, zorder=5)
    
    ax.text(8.35, 5.85, "• Optimality (35 pts): Paradigm choice", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 5.5, "• Time Big-O (25 pts): Redundant passes", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 5.15, "• Space (20 pts): Auxiliary allocation", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 4.8, "• Cleanliness (20 pts): Guard clauses", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 4.35, "Approach: User vs Optimal Benchmark", fontsize=7.5, fontweight='bold', color=c_yellow, zorder=5)
    ax.text(8.35, 4.0, "Dynamic Model Fallback: 3.8 -> 2.0 -> 1.5", fontsize=7, color=c_muted, zorder=5)

    # Progressive Hints Box
    draw_card(8.2, 1.0, 3.1, 2.6, bg=c_subcard, border=c_yellow, lw=1.2)
    ax.text(8.35, 3.3, "Pedagogical Hint Engine", fontsize=9, fontweight='bold', color=c_yellow, zorder=5)
    ax.text(8.35, 2.85, "Tier 1: Subtle Invariant Nudge", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 2.5, "Tier 2: Pattern & Data Structure", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 2.15, "Tier 3: Concrete Strategy Outline", fontsize=7.5, color=c_text, zorder=5)
    ax.text(8.35, 1.7, "Optimal Reference Code Snippet", fontsize=7.5, fontweight='bold', color=c_blue, zorder=5)
    ax.text(8.35, 1.3, "1-Click Insert in Editor / Copy", fontsize=7, color=c_muted, zorder=5)

    # ----------------- LAYER 4: DASHBOARD, HEATMAP & STORAGE (RIGHT) -----------------
    draw_card(11.8, 0.6, 3.7, 8.15, bg=c_card, border=c_border)
    ax.text(12.0, 8.45, "4. DASHBOARD & PERSISTENCE", fontsize=11, fontweight='bold', color=c_red, zorder=5)
    ax.text(12.0, 8.22, "Next.js 14 • Live Heatmap • Supabase", fontsize=7.5, color=c_muted, zorder=5)

    # Web Dashboard Pages Box
    draw_card(12.0, 4.9, 3.3, 3.15, bg=c_subcard, border=c_blue, lw=1.2)
    ax.text(12.15, 7.75, "Next.js 14 App Router", fontsize=9, fontweight='bold', color=c_blue, zorder=5)
    ax.text(12.15, 7.4, "• / : Google Dynamic Lighting Landing", fontsize=7.5, color=c_text, zorder=5)
    ax.text(12.15, 7.05, "• /dashboard : 16-Wk Submission Heatmap", fontsize=7.5, color=c_text, zorder=5)
    ax.text(12.15, 6.7, "• /submissions : Explorer & Filters", fontsize=7.5, color=c_text, zorder=5)
    ax.text(12.15, 6.35, "• /profile : Extension Token & Stats", fontsize=7.5, color=c_text, zorder=5)
    ax.text(12.15, 5.9, "• Real-Time Polling: 5-Second Interval", fontsize=7.5, fontweight='bold', color=c_green, zorder=5)
    ax.text(12.15, 5.5, "• Streaks: Current / Longest / Active Days", fontsize=7, color=c_muted, zorder=5)
    ax.text(12.15, 5.15, "• Multi-Platform Distribution Bars", fontsize=7, color=c_muted, zorder=5)

    # REST APIs Box
    draw_card(12.0, 3.3, 3.3, 1.45, bg=c_subcard, border=c_yellow, lw=1.0)
    ax.text(12.15, 4.45, "Serverless REST APIs", fontsize=8.5, fontweight='bold', color=c_yellow, zorder=5)
    ax.text(12.15, 4.1, "• GET /api/health  (200 OK)", fontsize=7.2, color=c_text, zorder=5)
    ax.text(12.15, 3.8, "• GET /api/analytics?userId=...", fontsize=7.2, color=c_text, zorder=5)
    ax.text(12.15, 3.5, "• POST /api/submissions (Bearer Auth)", fontsize=7.2, color=c_text, zorder=5)

    # Storage Box
    draw_card(12.0, 1.0, 3.3, 2.1, bg=c_subcard, border=c_green, lw=1.2)
    ax.text(12.15, 2.8, "Dual-Layer Resilient Storage", fontsize=8.5, fontweight='bold', color=c_green, zorder=5)
    ax.text(12.15, 2.45, "Cloud: Supabase PostgreSQL (Free)", fontsize=7.5, color=c_text, zorder=5)
    ax.text(12.15, 2.2, "  - profiles: id, email, token", fontsize=6.8, color=c_muted, zorder=5)
    ax.text(12.15, 1.95, "  - submissions: score, code, Big-O", fontsize=6.8, color=c_muted, zorder=5)
    ax.text(12.15, 1.6, "Offline Fallback: Local JSON File", fontsize=7.5, fontweight='bold', color=c_yellow, zorder=5)
    ax.text(12.15, 1.3, "  - dashboard/data/submissions.json", fontsize=6.8, color=c_muted, zorder=5)

    # ----------------- FLOW ARROWS & ANNOTATIONS -----------------
    arrow_props = dict(arrowstyle="->", lw=1.5, shrinkA=4, shrinkB=4)

    # 1. From Surfaces to Chrome Extension
    ax.annotate("", xy=(4.4, 6.2), xytext=(3.7, 6.2),
                arrowprops=dict(**arrow_props, color=c_yellow), zorder=10)
    ax.text(4.05, 6.35, "DOM Hooks", fontsize=6.5, color=c_yellow, ha='center', zorder=10)

    # 2. From VS Code to VS Code Extension
    ax.annotate("", xy=(4.4, 2.4), xytext=(3.7, 2.4),
                arrowprops=dict(**arrow_props, color=c_red), zorder=10)
    ax.text(4.05, 2.55, "TextEditor AST", fontsize=6.5, color=c_red, ha='center', zorder=10)

    # 3. From Chrome Service Worker to Gemini AI
    ax.annotate("", xy=(8.0, 6.5), xytext=(7.5, 6.5),
                arrowprops=dict(**arrow_props, color=c_blue), zorder=10)
    ax.text(7.75, 6.65, "HTTPS Prompt", fontsize=6.5, color=c_blue, ha='center', zorder=10)

    # 4. From VS Code Extension to Gemini AI
    ax.annotate("", xy=(8.0, 2.5), xytext=(7.5, 2.5),
                arrowprops=dict(**arrow_props, color=c_blue), zorder=10)
    ax.text(7.75, 2.65, "HTTPS Prompt", fontsize=6.5, color=c_blue, ha='center', zorder=10)

    # 5. From AI to Dashboard (Sync Flow)
    ax.annotate("", xy=(12.0, 4.0), xytext=(11.3, 4.0),
                arrowprops=dict(**arrow_props, color=c_green), zorder=10)
    ax.text(11.65, 4.15, "POST /api/submissions", fontsize=6.5, color=c_green, ha='center', zorder=10)

    # 6. From Dashboard to Storage
    ax.annotate("", xy=(13.65, 3.1), xytext=(13.65, 3.3),
                arrowprops=dict(**arrow_props, color=c_green), zorder=10)

    # Save to high-res PNG
    plt.tight_layout()
    png_path = "architecture.png"
    plt.savefig(png_path, dpi=dpi, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"[OK] Generated {png_path}")

    # Convert to JPG (RGB)
    jpg_path = "architecture.jpg"
    img = Image.open(png_path).convert('RGB')
    img.save(jpg_path, 'JPEG', quality=95)
    print(f"[OK] Generated {jpg_path}")

if __name__ == "__main__":
    build_architecture_diagram()
