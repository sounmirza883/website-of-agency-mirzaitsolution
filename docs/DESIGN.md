# Design

## Visual language

Dark surfaces, gold accent, heavy headings. The public website and the portals share the palette but implement it in three different ways — this is the single biggest source of styling mistakes in the repo.

| Surface | Styling |
|---|---|
| Website | Hand-written CSS in `globals.css`, **minified onto one line**, driven by CSS variables |
| Admin, Employee | Tailwind v4 with a `@theme` block that **inverts the gray scale** |
| Client | Inline `style={{}}` objects with CSS variables |
| Mobile | NativeWind (Tailwind v3) with `{DEFAULT, dark}` token pairs |

## The inverted palette — read before writing a class

`frontend/{admin,employee}/app/globals.css` remaps Tailwind's own colours:

```css
@theme {
  --color-white:    #1E293B;   /* bg-white is DARK SLATE */
  --color-gray-50:  #0F172A;   /* text-gray-50 is near-black */
  --color-gray-200: #334155;
  --color-gray-500: #94A3B8;
  --color-gray-900: #FFFFFF;   /* text-gray-900 is WHITE */
  --color-accent:   #FBBF24;   /* admin accent */
  --color-accent-2: #FCD34D;   /* employee accent */
}
```

So `bg-white` is a dark card, `text-gray-900` is white text, and `bg-accent text-gray-50` is the amber primary button with near-black text.

**Stock Tailwind colours are not remapped.** `bg-blue-600`, `bg-green-100`, `text-red-700` are real Tailwind values. Existing code mixes both — the one progress bar uses remapped `bg-gray-100` for its track and stock `bg-blue-600` for its fill.

Admin and employee `globals.css` are byte-identical; only the accent each app *uses* differs.

## Website CSS

All of it lives in `frontend/website/app/globals.css`, minified onto a single line. Add new rules in the same minified style.

Theme is driven by `[data-theme="dark"]` on `<html>`, set by `ThemeProvider`. Colours come from variables — `--canvas`, `--ink`, `--ink-muted`, `--soft`, `--surface`, `--line`, `--accent`, `--accent-light`. Avoid hardcoded colours.

### Floating labels

The contact form uses a `placeholder=" "` trick — a single space, not empty:

```html
<div class="form-group"><input placeholder=" " /><label>Full Name</label></div>
```

Input first, label second: the CSS uses the general sibling combinator. `:not(:placeholder-shown)` then keeps the label floated once something is typed.

`<select>` never matches `:placeholder-shown`, so select labels are pinned in the floated position permanently. Because labels are absolutely positioned, this adds no layout shift next to a text input in the same row.

## Gold blocks

`.color-block` sections invert to gold. Text on them is `#1A1200`, not white.

This has bitten repeatedly: the standard emphasis style paints `.section-title strong` with a gold gradient, which on a gold background renders the highlighted word **invisible**. Gold blocks override it to solid dark. When adding anything to a gold block, check the contrast — several rounds of fixes here were all the same class of bug.

## Portal layout

Fixed 256px sidebar, off-canvas below `md` with a `bg-black/30` scrim. A 64px header with hamburger, welcome text, email, avatar, Change Password and Logout. Content in `flex-1 p-4 md:p-6 overflow-auto`.

Nav items are text only — no icons in admin or employee, despite the `gap-3` that anticipates them. The client portal's nav does carry Font Awesome icons.

## Mobile

NativeWind with `darkMode: 'media'` — OS-level, no toggle. Tokens are `{DEFAULT, dark}` pairs rather than semantic auto-switching, so **every element must spell out both**:

```tsx
className="bg-surface dark:bg-surface-dark text-text dark:text-text-dark"
```

Palette is warm — `brand: #c67139`, cream surfaces — and deliberately different from the web portals. Text on brand fills is always the literal `#f5ead8`.

Fonts do not cascade in React Native; apply `font-sans` / `font-heading` per `<Text>`.

## What does not exist

There is **no design system**. No Button, Card, Modal, Table, Badge or PageHeader component in the web portals — every one is copy-pasted Tailwind. The only shared exports are `Field` and `fieldClass`.

When adding UI, copy the established markup rather than inventing a variant. [COMPONENTS.md](COMPONENTS.md) lists what exists and where the canonical copies are.
