from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Circle


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "figures" / "PHYS-2026-08-14-01"
OUT.mkdir(parents=True, exist_ok=True)

BLUE = "#0072B2"
ORANGE = "#E69F00"
GREEN = "#009E73"
RED = "#D55E00"
PURPLE = "#6F4E9C"
INK = "#17202A"
MUTED = "#52606D"
PAPER = "#FBFAF7"
LINE = "#CBD2D9"


def box(ax, xy, width, height, text, color, fontsize=12, lw=1.6):
    x, y = xy
    patch = FancyBboxPatch(
        (x, y),
        width,
        height,
        boxstyle="round,pad=0.018,rounding_size=0.025",
        facecolor=color + "18",
        edgecolor=color,
        linewidth=lw,
    )
    ax.add_patch(patch)
    ax.text(
        x + width / 2,
        y + height / 2,
        text,
        ha="center",
        va="center",
        fontsize=fontsize,
        color=INK,
        linespacing=1.25,
        weight="semibold",
    )
    return patch


def arrow(ax, start, end, color=MUTED, style="-|>", lw=1.8, connectionstyle="arc3"):
    ax.add_patch(
        FancyArrowPatch(
            start,
            end,
            arrowstyle=style,
            mutation_scale=14,
            linewidth=lw,
            color=color,
            connectionstyle=connectionstyle,
        )
    )


def save(fig, name):
    fig.savefig(OUT / name, dpi=220, bbox_inches="tight", facecolor=PAPER)
    plt.close(fig)


def graphical_abstract():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=PAPER)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    ax.text(
        0.5,
        0.94,
        "Two routes to universal clusters in effective low dimensions",
        ha="center",
        va="center",
        fontsize=22,
        weight="bold",
        color=INK,
    )
    ax.text(
        0.5,
        0.885,
        "interaction-induced reduction  |  confinement-induced reduction",
        ha="center",
        va="center",
        fontsize=12,
        color=MUTED,
    )

    box(ax, (0.055, 0.65), 0.35, 0.14, "Microwave-shielded\npolar molecules in free 3D", BLUE, 14)
    box(ax, (0.055, 0.40), 0.35, 0.14, "anisotropic $-r^{-3}$ attraction\n+ angular zero-point $r^{-4}$ core", ORANGE, 13)
    box(ax, (0.055, 0.15), 0.35, 0.14, "ordered 1D sectors\nBose--Fermi energy-density duality", GREEN, 13)
    arrow(ax, (0.23, 0.65), (0.23, 0.55), BLUE)
    arrow(ax, (0.23, 0.40), (0.23, 0.30), ORANGE)

    box(ax, (0.595, 0.65), 0.35, 0.14, "Light + heavy fermions\nin species-selective traps", PURPLE, 14)
    box(ax, (0.595, 0.40), 0.35, 0.14, "COM--relative coupling\n+ finite effective range", RED, 13)
    box(ax, (0.595, 0.15), 0.35, 0.14, "$a_{1D/2D}, R_{1D/2D}$\nSTM trimers and tetramers", GREEN, 13)
    arrow(ax, (0.77, 0.65), (0.77, 0.55), PURPLE)
    arrow(ax, (0.77, 0.40), (0.77, 0.30), RED)

    box(
        ax,
        (0.335, 0.008),
        0.33,
        0.095,
        "Shared criterion:\nshort-range details become irrelevant",
        GREEN,
        10.5,
    )
    arrow(ax, (0.23, 0.15), (0.41, 0.095), GREEN, connectionstyle="arc3,rad=-0.15")
    arrow(ax, (0.77, 0.15), (0.59, 0.095), GREEN, connectionstyle="arc3,rad=0.15")

    save(fig, "graphical-abstract.png")


def evidence_ladder():
    fig, ax = plt.subplots(figsize=(14, 8.2), facecolor=PAPER)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    ax.text(
        0.5,
        0.955,
        "What is computed exactly, reduced, and extrapolated?",
        ha="center",
        va="center",
        fontsize=22,
        weight="bold",
        color=INK,
    )
    ax.text(0.04, 0.865, "Microwave-shielded molecules", fontsize=15, weight="bold", color=BLUE)
    ax.text(0.04, 0.455, "Heteronuclear atoms in q1D / q2D", fontsize=15, weight="bold", color=PURPLE)

    xs = [0.04, 0.285, 0.53, 0.775]
    w = 0.185
    h = 0.16

    labels_top = [
        ("3D pair Hamiltonian\npartial-wave\ndiagonalization", BLUE),
        ("small-angle\nadiabatic reduction\n$U^{(2)}$ + BO benchmark", ORANGE),
        ("2D Jacobi-grid\neigensolver\nthree-molecule effective 1D", GREEN),
        ("pair-product chain\nself-bound droplet\nproposal", RED),
    ]
    for i, (label, color) in enumerate(labels_top):
        box(ax, (xs[i], 0.64), w, h, label, color, 9.8)
        if i < 3:
            arrow(ax, (xs[i] + w, 0.72), (xs[i + 1], 0.72), LINE)

    labels_bottom = [
        ("confined two-body\n$T$ matrix\nUV-regularized basis", PURPLE),
        ("low-$q$ extraction\n$a_d, R_d$\nexact dimer check", ORANGE),
        ("effective q1D / q2D\nSTM integral\nequations", GREEN),
        ("spectroscopic windows\nmany-body phase\nproposals", RED),
    ]
    for i, (label, color) in enumerate(labels_bottom):
        box(ax, (xs[i], 0.23), w, h, label, color, 9.8)
        if i < 3:
            arrow(ax, (xs[i] + w, 0.31), (xs[i + 1], 0.31), LINE)

    ax.text(0.055, 0.575, "direct 3D benchmark", color=BLUE, fontsize=10, weight="bold")
    ax.text(0.55, 0.575, "reduced few-body prediction", color=GREEN, fontsize=10, weight="bold")
    ax.text(0.795, 0.575, "many-body extrapolation", color=RED, fontsize=10, weight="bold")
    ax.text(0.055, 0.165, "exact confined two-body", color=PURPLE, fontsize=10, weight="bold")
    ax.text(0.55, 0.165, "effective few-body prediction", color=GREEN, fontsize=10, weight="bold")
    ax.text(0.795, 0.165, "experimental inference", color=RED, fontsize=10, weight="bold")

    ax.plot([0.04, 0.96], [0.535, 0.535], color=LINE, linewidth=1.0)
    ax.text(
        0.5,
        0.075,
        "Confidence decreases when a result is carried across an unbenchmarked reduction step.",
        ha="center",
        fontsize=12,
        color=MUTED,
    )

    save(fig, "evidence-ladder.png")


if __name__ == "__main__":
    graphical_abstract()
    evidence_ladder()
    for path in sorted(OUT.glob("*.png")):
        print(f"generated {path.relative_to(ROOT)}")
