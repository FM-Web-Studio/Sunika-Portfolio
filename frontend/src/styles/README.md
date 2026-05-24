# Design System — Styles

Two foundational CSS files defining the visual language for the entire application. Neutral-first, single teal accent, no gradient text or glow on static elements.

---

## Philosophy

- **Neutral-first.** Backgrounds, surfaces, and text use a cool-gray scale. Color is used sparingly.
- **Single accent.** Teal (`--accent-1`) is the only brand color — used for interactive states, focus rings, links, and primary buttons.
- **No noise.** No gradient text, no large transforms on hover. Motion is opacity, background, border, and shadow only.
- **Accessible by default.** WCAG AA contrast ratios. Focus states always visible.

---

## Files

### `Theme.css`

Single source of truth for all CSS custom properties.

| Section | Variables |
|---|---|
| General Settings | `--font-size-*`, `--spacing-*`, `--radius-*`, `--transition-*`, `--shadow-*`, `--z-*` |
| Color Palette | All light/dark color tokens |
| Theme Overrides | `[data-theme="dark"]` variable remaps |
| Page & Body | `html`, `body`, scroll behaviour, gradient background |
| Responsive Breakpoints | `@media` blocks that scale typography and spacing |

**Color token pattern:**
```css
--{token}-light   → light mode value
--{token}-dark    → dark mode value
--{token}         → applied alias (defaults light; overridden by [data-theme="dark"])
```

---

### `Components.css`

Styles all base HTML elements. Consumes only variables from `Theme.css` — no hardcoded values.

Sections (in order): Base · Typography · Links · Lists · Buttons · Labels · Form Inputs · Text Inputs · Textarea · Select · Checkbox · Radio · Date & Time Inputs · File Input · Range Slider · Fieldset & Legend · Details & Summary · Table · Code & Pre · Blockquote · Dialog · Progress · Meter · Output · Mark · Kbd · Abbr · Figure & Figcaption · Images · HR · Scrollbar · Focus · Selection · Utility Classes

**Button variants:**

| Class | Role |
|---|---|
| *(default)* | Primary — teal fill |
| `.btn-secondary` | Neutral glass surface |
| `.btn-outline` | Teal border, transparent fill |
| `.btn-ghost` | No border, minimal |
| `.btn-danger` | Destructive |
| `.btn-success` | Confirmatory |

---

### `Wrappers.css`

Layout utility classes used as wrappers around form fields.

- `.input-container` — flex column wrapper with bottom margin; appends a red `*` for required fields via `:has()`; hides the asterisk once the field has a valid value

---

## Conventions

### Variable naming
```css
--{property}-{scale}    /* e.g. --font-size-lg, --spacing-md */
--{token}-{mode}        /* e.g. --accent-1-light, --background-2-dark */
--{token}               /* applied alias  e.g. --accent-1, --background-2 */
```

### Adding a new token
1. Define light + dark values in `Theme.css`
2. Add applied alias at the bottom of `:root`
3. Override inside `[data-theme="dark"]`

### Adding component styles
- Use only `Theme.css` variables. Never hardcode colors, spacing, or radius.
- Hover: prefer `var(--transition-fast)`. Layout/theme: `var(--transition-slow)`.
- Always include a `focus-visible` state using `outline: 2px solid var(--accent-1)`.
- Test both light and dark modes.

