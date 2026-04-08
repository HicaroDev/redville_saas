# Design System Specification: Architectural Precision

## 1. Overview & Creative North Star
The construction industry is built on structural integrity, precision, and layering. This design system moves away from the "cluttered dashboard" trope of legacy industrial software, adopting a Creative North Star we call **"The Blueprint Editorial."**

We treat the screen as a high-end architectural plan: expansive, high-contrast, and hyper-organized. We achieve a premium feel not through decoration, but through **intentional asymmetry** and **tonal depth**. By utilizing generous white space (inspired by *Linear*) and sophisticated color transitions (inspired by *Stripe*), we create an environment that feels authoritative yet effortless to navigate.

---

## 2. Colors: Tonal Architecture
We move beyond flat hex codes to a tiered system of surfaces.

### Surface Hierarchy & The "No-Line" Rule
To achieve a high-end look, **prohibit the use of 1px solid borders for sectioning.** Boundaries are defined by background color shifts.
- **Base Layer:** `surface` (#F8F9FA). The drawing board.
- **Sectioning:** Use `surface_container_low` (#F3F4F5) for sidebars or secondary content areas.
- **Primary Workspaces:** Use `surface_container_lowest` (#FFFFFF) for cards and main content areas to create a "lifted" feel.

### Signature Textures & Glassmorphism
- **The CTA Gradient:** For primary actions, do not use flat blue. Apply a subtle linear gradient from `primary` (#004AC6) to `primary_container` (#2563EB) at a 135° angle.
- **Glass Overlays:** For floating modals or navigation rails, use `surface_container_lowest` with 80% opacity and a `24px` backdrop-blur. This keeps the construction site "context" visible underneath while maintaining legibility.

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Action** | `primary` | #004AC6 | Brand touchpoints, Primary Buttons. |
| **Status: OK** | `on_secondary_container` | #57657B | Positive project health. |
| **Status: Risk** | `error` | #BA1A1A | Critical budget/safety alerts. |
| **Status: Note** | `tertiary` | #943700 | Pending approvals/Attention. |

---

## 3. Typography: The Inter Hierarchy
We use **Inter** exclusively. Its neutral, geometric nature mimics technical documentation while remaining highly legible at small scales.

- **Editorial Scale:** Use `display-lg` (3.5rem) for high-level project KPIs. This creates a bold, "magazine-style" focal point.
- **Information Density:** Use `body-md` (0.875rem) for data tables and cost center trees.
- **Labeling:** `label-sm` (0.6875rem) should always be Uppercase with +5% letter spacing to evoke the feel of architectural blueprints.

---

## 4. Elevation & Depth: The Layering Principle
Forget traditional drop shadows. We define depth through **Tonal Layering**.

- **The Stacking Rule:** Place a `surface_container_lowest` (#FFFFFF) card on top of a `surface_container_low` (#F3F4F5) background. The contrast alone provides the "lift."
- **Ambient Shadows:** Only use shadows on floating elements (modals/tooltips). Use an expansive blur: `0px 12px 32px rgba(25, 28, 29, 0.04)`. The shadow must feel like a soft glow of light, not a dark smudge.
- **Ghost Borders:** If a table or input requires a border for accessibility, use `outline_variant` at **20% opacity**. It should be felt, not seen.

---

## 5. Components: Structural Elements

### KPI Widgets
- **Style:** No borders. Background: `surface_container_lowest`. 
- **Detail:** Use a `primary` 2px vertical accent bar on the left side of the card to indicate the primary metric.

### Data Tables & Cost Center Trees
- **The "No-Divider" Rule:** Remove horizontal lines between rows. Use the Spacing Scale `3` (1rem) between rows. Highlight the hovered row using `surface_container_high`.
- **Tree Structures:** Use `outline_variant` (20% opacity) for the vertical nesting lines to keep the "blueprint" aesthetic.

### Buttons & Inputs
- **Primary Button:** Radius `md` (0.75rem). Gradient fill. White text.
- **Input Fields:** Use `surface_container_highest` for the background with no border. On focus, transition to `surface_container_lowest` with a 1px `primary` ghost border.

### Chips (Status Tags)
- **Execution:** Do not use high-saturation backgrounds. Use "On-Container" colors.
- **Example:** A "Risk" chip uses `error_container` background with `on_error_container` text. This ensures professional restraint.

---

## 6. Do’s and Don’ts

### Do
- **Do** embrace the "Empty Space." If a section feels crowded, increase padding to `spacing.8` (2.75rem).
- **Do** use `surface_bright` to highlight the most important action in a sea of neutral tones.
- **Do** ensure all typography follows the fixed scale to maintain the "Editorial" feel.

### Don't
- **Don't** use black (#000000). Use `on_surface` (#191C1D) for all text to maintain a sophisticated charcoal tone.
- **Don't** use standard 1px borders to separate dashboard widgets. Use the transition from `surface` to `surface_container_low`.
- **Don't** use "Electric Blue" at 100% saturation for large areas. Use it as a precision instrument for buttons and active states.

---

## 7. Spacing & Radius
Consistency is the bedrock of this system.

- **Corner Radius:** Standardize on `lg` (1rem) for all main containers and `md` (0.75rem) for interactive components like buttons.
- **The "Breath" Rule:** The minimum padding for any container is `spacing.4` (1.4rem). This prevents the UI from feeling "industrial" or "cramped."