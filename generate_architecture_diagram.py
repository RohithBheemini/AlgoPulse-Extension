import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.path import Path
from PIL import Image

def build_drawio_square_image():
    # 1:1 Square figure (680x680 logical coordinates -> 2040x2040 px at 300 DPI)
    fig, ax = plt.subplots(figsize=(6.8, 6.8), dpi=300)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 680)
    ax.set_ylim(680, 0)  # Top-down coordinate system matching Draw.io (0 at top, 680 at bottom)
    ax.axis('off')

    font_family = 'sans-serif'

    def draw_rect(x, y, w, h, lines, rounded=False):
        if rounded:
            patch = patches.FancyBboxPatch(
                (x, y), w, h,
                boxstyle="round,pad=0,rounding_size=12",
                facecolor='#FFFFFF', edgecolor='#000000', linewidth=1.2, zorder=3
            )
        else:
            patch = patches.Rectangle(
                (x, y), w, h,
                facecolor='#FFFFFF', edgecolor='#000000', linewidth=1.2, zorder=3
            )
        ax.add_patch(patch)
        render_text_lines(x + w / 2, y + h / 2, lines)

    def draw_cylinder(x, y, w, h, lines):
        # Standard Draw.io cylinder3 shape (top ellipse + body + bottom curve)
        ry = 14  # vertical radius of cylinder cap
        # Body rectangle + bottom ellipse
        body = patches.FancyBboxPatch(
            (x, y + ry), w, h - 2 * ry,
            boxstyle="square,pad=0",
            facecolor='#FFFFFF', edgecolor='none', zorder=3
        )
        ax.add_patch(body)

        bottom_ellipse = patches.Ellipse(
            (x + w / 2, y + h - ry), w, 2 * ry,
            facecolor='#FFFFFF', edgecolor='#000000', linewidth=1.2, zorder=3
        )
        ax.add_patch(bottom_ellipse)

        # Cover top half of bottom ellipse border
        cover_rect = patches.Rectangle(
            (x, y + ry), w, h - 2 * ry,
            facecolor='#FFFFFF', edgecolor='none', zorder=3.5
        )
        ax.add_patch(cover_rect)

        # Left and right vertical lines
        ax.plot([x, x], [y + ry, y + h - ry], color='#000000', linewidth=1.2, zorder=4)
        ax.plot([x + w, x + w], [y + ry, y + h - ry], color='#000000', linewidth=1.2, zorder=4)

        # Top ellipse (cap)
        top_ellipse = patches.Ellipse(
            (x + w / 2, y + ry), w, 2 * ry,
            facecolor='#FFFFFF', edgecolor='#000000', linewidth=1.2, zorder=4
        )
        ax.add_patch(top_ellipse)

        render_text_lines(x + w / 2, y + ry + (h - ry) / 2 + 2, lines)

    def render_text_lines(cx, cy, lines):
        line_spacing = 18
        total_h = (len(lines) - 1) * line_spacing
        start_y = cy - total_h / 2
        for idx, (text, is_bold) in enumerate(lines):
            ax.text(
                cx, start_y + idx * line_spacing, text,
                ha='center', va='center',
                fontsize=9.5 if is_bold else 8.8,
                fontweight='bold' if is_bold else 'normal',
                fontfamily=font_family,
                color='#000000',
                zorder=5
            )

    def draw_ortho_arrow(points, label="", label_pos=None, bidirectional=False):
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        # Draw intermediate segments if >2 points
        if len(points) > 2:
            ax.plot(xs[:-1], ys[:-1], color='#000000', linewidth=1.1, zorder=2)
        # Draw final segment with arrowhead
        p_start = points[-2]
        p_end = points[-1]
        style = "<|-|>" if bidirectional else "-|>"
        ax.annotate(
            "", xy=p_end, xytext=p_start,
            arrowprops=dict(
                arrowstyle=style,
                color='#000000',
                lw=1.1,
                mutation_scale=11,
                shrinkA=0,
                shrinkB=0
            ),
            zorder=4
        )
        if label and label_pos:
            ax.text(
                label_pos[0], label_pos[1], label,
                ha='center', va='center',
                fontsize=8, fontfamily=font_family, color='#000000',
                bbox=dict(boxstyle='square,pad=0.15', facecolor='#FFFFFF', edgecolor='none'),
                zorder=6
            )

    # =========================================================================
    # DRAW NODES (Matching algopulse_architecture.drawio coordinates)
    # =========================================================================
    # Row 1: Coding Surfaces
    draw_rect(50, 40, 230, 75, [
        ("Web Coding Platforms", True),
        ("(LeetCode, GFG, HackerRank)", False)
    ])

    draw_rect(400, 40, 230, 75, [
        ("VS Code IDE", True),
        ("(Local Code Files)", False)
    ])

    # Row 2: Client Extensions
    draw_rect(50, 175, 230, 75, [
        ("Chrome Extension (MV3)", True),
        ("In-Page Review Drawer", False)
    ])

    draw_rect(400, 175, 230, 75, [
        ("VS Code Extension", True),
        ("Activity Bar Webview Panel", False)
    ])

    # Row 3: AI Engine (Rounded Rectangle)
    draw_rect(190, 320, 300, 115, [
        ("Google Gemini Flash API", True),
        ("- 4-Pillar Score (0-100)", False),
        ("- 3-Tier Progressive Hints", False),
        ("- Big-O Complexity Check", False)
    ], rounded=True)

    # Row 4: Dashboard & Database
    draw_rect(50, 510, 250, 110, [
        ("Next.js 14 Web Dashboard", True),
        ("- 16-Week Activity Heatmap", False),
        ("- 14-Paradigm Radar", False),
        ("- Spaced Repetition Queue", False)
    ])

    draw_cylinder(430, 515, 190, 100, [
        ("Supabase PostgreSQL", True),
        ("+ Local JSON Fallback", False)
    ])

    # =========================================================================
    # DRAW ORTHOGONAL ARROWS
    # =========================================================================
    # 1. Web -> Chrome Extension
    draw_ortho_arrow(
        [(165, 115), (165, 175)],
        label="Extract Code", label_pos=(165, 145)
    )

    # 2. VS Code IDE -> VS Code Extension
    draw_ortho_arrow(
        [(515, 115), (515, 175)],
        label="Ctrl+Alt+A", label_pos=(515, 145)
    )

    # 3. Chrome Extension -> Gemini Flash API
    draw_ortho_arrow(
        [(165, 250), (165, 285), (265, 285), (265, 320)],
        label="HTTPS Request", label_pos=(205, 285)
    )

    # 4. VS Code Extension -> Gemini Flash API
    draw_ortho_arrow(
        [(515, 250), (515, 285), (415, 285), (415, 320)],
        label="HTTPS Request", label_pos=(475, 285)
    )

    # 5. Gemini Flash API -> Next.js Web Dashboard
    draw_ortho_arrow(
        [(340, 435), (340, 472), (175, 472), (175, 510)],
        label="POST /api/submissions", label_pos=(258, 472)
    )

    # 6. Next.js Web Dashboard <-> Supabase PostgreSQL
    draw_ortho_arrow(
        [(300, 565), (430, 565)],
        label="Read / Write", label_pos=(365, 565),
        bidirectional=True
    )

    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    # Save outputs in root directory
    for png_name in ["architecture.png", "algopulse_architecture_square.png"]:
        plt.savefig(png_name, dpi=300, facecolor='#FFFFFF', edgecolor='none')
        print(f"[OK] Saved {png_name}")

    plt.close()

    img = Image.open("architecture.png").convert("RGB")
    img.save("architecture.jpg", "JPEG", quality=95)
    print("[OK] Saved architecture.jpg")

if __name__ == "__main__":
    build_drawio_square_image()
