from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
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


def effective_potential_anatomy():
    """Plot the controlled short-distance asymptote of Eq. (4).

    The two coefficients are scaled so that the asymptotic potential has its
    minimum at x = r / r_m = 1.  This is a power-counting figure, not a fit to
    a particular molecule or a digitization of the paper.
    """
    x = np.linspace(0.45, 4.0, 900)
    repulsive = x**-4
    attractive = -(4.0 / 3.0) * x**-3
    total = repulsive + attractive

    fig, ax = plt.subplots(figsize=(12.5, 7.2), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    ax.axhline(0, color=LINE, linewidth=1.1)
    ax.axvspan(0.45, 0.78, color=RED, alpha=0.055, label="impenetrable core")
    ax.axvspan(0.78, 1.45, color=GREEN, alpha=0.055, label="bound-state support")
    ax.plot(x, repulsive, color=RED, linewidth=2.4, label=r"angular zero-point core $+x^{-4}$")
    ax.plot(x, attractive, color=BLUE, linewidth=2.4, label=r"dipolar tail $-(4/3)x^{-3}$")
    ax.plot(x, total, color=INK, linewidth=3.0, label="asymptotic sum")
    ax.scatter([1], [-1 / 3], s=75, color=ORANGE, edgecolor=PAPER, linewidth=1.3, zorder=5)
    ax.annotate(
        r"$r=r_m$",
        xy=(1, -1 / 3),
        xytext=(1.24, 1.0),
        arrowprops={"arrowstyle": "->", "color": ORANGE, "lw": 1.5},
        color=ORANGE,
        fontsize=12,
        weight="bold",
    )
    ax.set_xlim(0.45, 4.0)
    ax.set_ylim(-1.25, 9.5)
    ax.set_xlabel(r"scaled separation $x=r/r_m$", fontsize=13)
    ax.set_ylabel("potential in an arbitrary common scale", fontsize=13)
    ax.set_title("How angular zero-point motion stabilizes a field-linked well", fontsize=19, weight="bold", color=INK)
    ax.text(
        0.02,
        0.95,
        "Short-distance asymptote of the effective two-molecule potential",
        transform=ax.transAxes,
        color=MUTED,
        fontsize=11,
        va="top",
    )
    ax.legend(frameon=False, loc="upper right", fontsize=10.5)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", color=LINE, alpha=0.45, linewidth=0.8)
    save(fig, "effective-potential-anatomy.png")


def com_relative_coupling():
    """Show the quadratic trap in COM-relative coordinates for Li-Cr."""
    mh, ml = 8.8, 1.0
    mass_sum = mh + ml
    z_cm = np.linspace(-2.2, 2.2, 401)
    z_rel = np.linspace(-2.2, 2.2, 401)
    Z, z = np.meshgrid(z_cm, z_rel)

    def trap(omega_h, omega_l):
        zh = Z + (ml / mass_sum) * z
        zl = Z - (mh / mass_sum) * z
        value = 0.5 * mh * omega_h**2 * zh**2 + 0.5 * ml * omega_l**2 * zl**2
        return value / np.percentile(value, 72)

    uncoupled = trap(1.0, 1.0)
    equal_length = trap(1.0 / mh, 1.0 / ml)
    levels = np.linspace(0.08, 1.35, 8)

    fig, axes = plt.subplots(1, 2, figsize=(13.5, 6.3), facecolor=PAPER, sharex=True, sharey=True)
    panels = [
        (axes[0], uncoupled, r"equal frequencies: $\omega_h=\omega_l$", "cross term vanishes"),
        (
            axes[1],
            equal_length,
            r"equal oscillator lengths: $m_h\omega_h=m_l\omega_l$",
            r"tilt from $\mu(\omega_h^2-\omega_l^2)Zz$",
        ),
    ]
    for ax, values, title, note in panels:
        ax.contourf(Z, z, values, levels=levels, cmap="Blues", alpha=0.78, extend="max")
        ax.contour(Z, z, values, levels=levels, colors=INK, linewidths=0.6, alpha=0.55)
        ax.axhline(0, color=PAPER, linewidth=0.8, alpha=0.9)
        ax.axvline(0, color=PAPER, linewidth=0.8, alpha=0.9)
        ax.set_title(title, fontsize=12.5, weight="bold", color=INK, pad=12)
        ax.text(0.5, 0.055, note, transform=ax.transAxes, ha="center", color=ORANGE, fontsize=10.5, weight="bold")
        ax.set_xlabel(r"COM coordinate $Z$ (scaled)", fontsize=11.5)
        ax.set_aspect("equal")
        ax.spines[["top", "right"]].set_visible(False)
    axes[0].set_ylabel(r"relative coordinate $z$ (scaled)", fontsize=11.5)
    fig.suptitle("Species-selective confinement rotates the collision channels", fontsize=20, weight="bold", color=INK)
    fig.text(
        0.5,
        0.91,
        r"Quadratic trap contours for a representative $m_h/m_l=8.8$ mixture",
        ha="center",
        color=MUTED,
        fontsize=11,
    )
    fig.subplots_adjust(top=0.82, wspace=0.16)
    save(fig, "com-relative-coupling.png")


def cluster_binding_windows():
    """Plot the favorable relative-binding intervals quoted in the paper."""
    rows = [
        ("q2D Li-Cr", 0.28, 0.92, 0.18, 0.50),
        ("q2D Li-K", 0.17, 0.80, 0.10, 0.42),
        ("q1D Li-Cr", 1.79, 7.85, 0.35, 1.13),
        ("q1D Li-K", 1.41, 8.81, 0.21, 1.23),
    ]
    y = np.arange(len(rows))[::-1]

    fig, ax = plt.subplots(figsize=(12.5, 6.8), facecolor=PAPER)
    ax.set_facecolor(PAPER)
    for yi, (label, tri_lo, tri_hi, tet_lo, tet_hi) in zip(y, rows):
        tri_mid = np.sqrt(tri_lo * tri_hi)
        tet_mid = np.sqrt(tet_lo * tet_hi)
        ax.errorbar(
            tri_mid,
            yi + 0.13,
            xerr=[[tri_mid - tri_lo], [tri_hi - tri_mid]],
            fmt="o",
            markersize=7,
            color=BLUE,
            ecolor=BLUE,
            elinewidth=4,
            capsize=5,
            label=r"trimer $|\Delta_{3,2}|/h$" if yi == y[0] else None,
        )
        ax.errorbar(
            tet_mid,
            yi - 0.13,
            xerr=[[tet_mid - tet_lo], [tet_hi - tet_mid]],
            fmt="s",
            markersize=6.5,
            color=ORANGE,
            ecolor=ORANGE,
            elinewidth=4,
            capsize=5,
            label=r"tetramer $|\Delta_{4,3}|/h$" if yi == y[0] else None,
        )
    ax.set_xscale("log")
    ax.set_xlim(0.07, 12)
    ax.set_yticks(y, [row[0] for row in rows])
    ax.set_xlabel("relative binding frequency in the reported favorable window (kHz)", fontsize=12)
    ax.set_title(r"Cluster separation from the nearest breakup threshold at $l_{ho}=700a_0$", fontsize=18, weight="bold", color=INK)
    ax.text(
        0.99,
        0.02,
        "Intervals transcribed from arXiv:2606.02988v1; logarithmic horizontal axis",
        transform=ax.transAxes,
        ha="right",
        color=MUTED,
        fontsize=9.5,
    )
    ax.legend(frameon=False, loc="upper left", fontsize=10.5)
    ax.grid(axis="x", which="both", color=LINE, alpha=0.55, linewidth=0.8)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.tick_params(axis="y", length=0)
    save(fig, "cluster-binding-windows.png")


if __name__ == "__main__":
    graphical_abstract()
    evidence_ladder()
    effective_potential_anatomy()
    com_relative_coupling()
    cluster_binding_windows()
    for path in sorted(OUT.glob("*.png")):
        print(f"generated {path.relative_to(ROOT)}")
