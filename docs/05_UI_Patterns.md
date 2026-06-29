# 05 — UI Patterns

## Design System

### Color Palette

All tokens defined in `src/app/globals.css` via `@theme { }`:

```css
--color-cream-50:  #fdfaf6   /* page background */
--color-cream-100: #faf5ee   /* section backgrounds, admin page bg */
--color-cream-200: #f5ece0   /* borders, hover backgrounds, image placeholders */
--color-cream-300: #eddcc8   /* lighter borders, dividers */
--color-gold-300:  #e8d5a3   /* announcement bar text, banner text */
--color-gold-400:  #d4b96a   /* dividers, scrollbar thumb, decorative lines */
--color-gold-500:  #c4a35a   /* primary action color (CTA buttons, cart badge, featured badge) */
--color-gold-600:  #a8873d   /* hover state for gold-500, category labels, price text */
--color-gold-700:  #8b6914   /* category "Explore" text on hover */
--color-brand-50:  #fdf8f0   /* alias for cream */
--color-brand-100: #f8eedc
--color-brand-200: #edd5b0
--color-brand-500: #c4a35a   /* alias for gold-500 */
--color-brand-600: #a8873d   /* alias for gold-600 */
--color-brand-700: #8b6914   /* alias for gold-700 */
--color-dark-900:  #1c1510   /* primary text, buttons background, announcement bar bg */
--color-dark-800:  #2d2218   /* hover state for dark-900 buttons */
--color-dark-700:  #3d3020   /* secondary text, labels */
```

**Color roles in practice:**

| Context | Color |
|---|---|
| Page background | `bg-cream-50` |
| Section background (alternating) | `bg-cream-100` |
| Borders | `border-cream-200` / `border-cream-300` |
| Image placeholders | `bg-cream-200` gradient to `bg-cream-300` |
| Primary text | `text-dark-900` |
| Secondary / label text | `text-dark-700` |
| Primary CTA button | `bg-dark-900 text-cream-50 hover:bg-dark-800` |
| Gold CTA / featured badge | `bg-gold-500 hover:bg-gold-600 text-dark-900` |
| Gold accents (prices, category labels) | `text-gold-600` |
| Decorative dividers | `bg-gold-400` |
| Cart badge, active elements | `bg-gold-500` |
| Discount badge | `bg-dark-900 text-cream-50` |
| Footer background | `bg-dark-900 text-cream-200` |

---

## Typography System

### Fonts

Loaded in `src/app/layout.tsx` via `next/font/google`:

```typescript
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})
```

The `variable` option injects CSS variables `--font-cormorant` and `--font-montserrat`. Both are added to `<html>` as class names; `font-montserrat` is set as the default on `<body>`.

Defined in `globals.css`:
```css
--font-cormorant: "Cormorant Garamond", Georgia, serif;
--font-montserrat: "Montserrat", system-ui, sans-serif;
```

And as utility classes:
```css
.font-cormorant  { font-family: var(--font-cormorant); }
.font-montserrat { font-family: var(--font-montserrat); }
```

### Usage Context

| Element | Font | Weight | Size |
|---|---|---|---|
| Hero headline | Cormorant Garamond | 400 (normal) | `text-5xl` to `text-7xl` |
| Section headings | Cormorant Garamond | 400 | `text-3xl` to `text-5xl` |
| Product names (card) | Cormorant Garamond | 400 | `text-base` |
| Product names (detail) | Cormorant Garamond | 400 | `text-4xl` to `text-5xl` |
| Cart item name | Cormorant Garamond | 400 | `text-base` |
| Empty state text | Cormorant Garamond | 400, italic | `text-xl` |
| Brand logo text (admin) | Cormorant Garamond | 400 | `text-2xl` to `text-4xl` |
| Body text / descriptions | Montserrat | 300-400 | `text-sm` |
| Navigation links | Montserrat | 400 | `text-[11px] tracking-widest uppercase` |
| Category micro-labels | Montserrat | 400 | `text-[9px]` or `text-[10px] tracking-[0.4em] uppercase` |
| Badge / status labels | Montserrat | 400 | `text-[9px] tracking-widest uppercase` |
| Button text | Montserrat | 500 | `text-[10px]` to `text-[11px] tracking-widest uppercase` |
| Announcement bar | Montserrat | 400 | `text-[10px] tracking-widest` |
| Footer section labels | Montserrat | 400 | `text-[10px] tracking-widest uppercase text-gold-400` |

**Key typographic rule:** Small labels (categories, statuses, navigation items, buttons) always use `tracking-widest uppercase` with tiny `text-[9px]` to `text-[11px]` sizes. This is the signature micro-label pattern of the luxury aesthetic.

---

## Animation Classes

Defined as keyframes + `.animate-*` classes in `globals.css`:

### fadeInUp

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.6s ease forwards; }
```

Used on: Hero banner fallback content (entrance animation on page load).

### fadeIn

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.4s ease forwards; }
```

Available but used sparingly.

### slideInRight

```css
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.animate-slide-in-right { animation: slideInRight 0.35s ease forwards; }
```

Used on: `CartDrawer` (`<aside className="... animate-slide-in-right">`). The cart drawer slides in from the right edge.

### slideInLeft

```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
.animate-slide-in-left { animation: slideInLeft 0.3s ease forwards; }
```

Used on: Mobile navigation drawer in `Navbar.tsx` (`<div className="... animate-slide-in-left">`).

### marquee

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 28s linear infinite; }
```

Used on: `AnnouncementBar`. The text string is doubled (`{text}{text}`) so that when the animation moves it left by 50%, the second copy seamlessly fills in. This creates the illusion of infinite scrolling without a gap.

GPU optimization via `willChange: 'transform'` is applied inline:
```tsx
<span className="inline-block whitespace-nowrap animate-marquee" style={{ willChange: 'transform' }}>
```

This promotes the element to its own compositor layer, preventing the CPU from repainting on every animation frame.

---

## Hover Transitions

Non-animated transitions use Tailwind's `transition-*` utilities:

- `transition-colors` — color, background-color, border-color (duration-300 default)
- `transition-transform` — scale, translate (duration-700 for slow hover on product images)
- `transition-all duration-300` — used on CTA button hover (border/bg/color)
- `transition-opacity duration-500` — banner image cross-fade

**Product image scale on hover:**
```tsx
<Image className="object-cover transition-transform duration-700 group-hover:scale-105" />
```

**"Add to Bag" button reveal on hover:**
```tsx
<div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
```

The button starts translated fully below the card (`translate-y-full`), then slides up on `group-hover`. The parent `Link` has the `group` class.

---

## Responsive Patterns

### Breakpoints

Only `md:` (768px) is used in the codebase. No `sm:`, `lg:`, `xl:` breakpoints except in specific cases:

```tsx
// Hero banner — sm only for font size
text-5xl sm:text-6xl md:text-7xl

// Product grid — lg for 4 columns
grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

### Layout Shifts

- Store layout: `<main className="pb-16 md:pb-0">` — 64px bottom padding on mobile for MobileBottomNav
- MobileBottomNav: `md:hidden` — disappears at 768px
- Navbar secondary bar: `hidden md:block` — only desktop
- Navbar desktop header: `hidden md:grid` — only desktop
- Navbar mobile header: `md:hidden` — only mobile

### Grid Systems

```tsx
grid-cols-2 md:grid-cols-4         // Featured products, new arrivals, features strip, admin stats
grid-cols-2 md:grid-cols-3         // Category grid
grid-cols-2 md:grid-cols-3 lg:grid-cols-4  // Shop listing
grid-cols-2 md:grid-cols-4 gap-8   // About page values
```

---

## Luxury Fallback Design Philosophy

Every state where real content is absent must look intentional, not broken. This is the luxury fallback principle.

**No banners** (`HeroBanner` fallback):
- Full-height (`h-[72vh] md:h-[88vh]`) section with cream gradient
- Four decorative corner frames in gold opacity
- Editorial headline in Cormorant Garamond: "For the moments before forever"
- Gold divider line with ✦ ornament
- CTA button: "Discover the Collection"

**No category image** (`CategoryGrid` fallback):
- Champagne gradient `bg-gradient-to-br from-[#e8dcc4] to-[#c8a870]`
- Six gradient variants (indexed by position) so adjacent cards don't look identical

**No product image** (`ProductCard` fallback):
- `bg-gradient-to-br from-cream-200 to-cream-300` with italic "M" monogram centred

**Product image fallback (detail page):**
- Same cream gradient, italic "M" at `text-8xl`

**Empty cart:**
- Large `ShoppingBag` icon in `text-cream-300`
- Cormorant italic: "Your bag is empty"
- Montserrat micro-label: "Add something beautiful"
- "Continue Shopping" button with full border treatment

**No products in shop:**
- Cormorant italic: "No products yet"
- Montserrat micro-label: "Check back soon"

---

## Component Pattern Library

### ProductCard — 3:4 Aspect Ratio

```tsx
<div className="relative bg-cream-200 overflow-hidden aspect-[3/4]">
```

The `aspect-[3/4]` is a portrait ratio (width:height = 3:4) suitable for fashion photography. All product cards are the same height regardless of image dimensions because `object-cover` fills the fixed-ratio container.

Badges (`-N%`, `Featured`) are positioned `absolute top-3 left-3` in a flex-col stack.

### CartDrawer — Slide-in Right

```tsx
<div className="fixed inset-0 z-50 flex justify-end">
  <div className="absolute inset-0 bg-black/50" onClick={closeCart} />
  <aside className="relative w-full max-w-sm bg-cream-50 h-full flex flex-col animate-slide-in-right shadow-2xl">
```

- `fixed inset-0` — full-screen overlay
- `z-50` — above all page content
- `bg-black/50` backdrop closes drawer on click
- `max-w-sm` (384px) drawer width
- `flex flex-col` with `flex-1 overflow-y-auto` on items area and fixed-height footer

### AnnouncementBar — GPU-Optimized Marquee

The text string is constructed by joining 5 messages with 5-space separators, then doubling it:

```tsx
const text = messages.join('     ')
// render: {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
```

The `&nbsp;` entities add spacing between the end of the first copy and the start of the second. The animation moves left by exactly 50% (half the total width), landing the second copy perfectly in place when it loops.

### MobileBottomNav — Safe-area Pattern

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50 border-t border-cream-200 pb-safe">
```

`pb-safe` is a custom utility defined in `globals.css`:

```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

`env(safe-area-inset-bottom)` is the iOS safe area variable. On iPhones with home indicator, this adds the correct bottom padding so nav tabs aren't hidden under the gesture bar. On devices without a home indicator, it falls back to `0px`.

The `pb-16` on `<main>` in the store layout (`main className="pb-16 md:pb-0"`) ensures page content doesn't scroll behind the nav bar (64px = h-16).

### Spinner Pattern

The loading spinner is inline CSS, used everywhere across the codebase:

```tsx
<div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
```

`border-t-transparent` makes one quadrant of the border invisible, creating the spinning arc effect. Tailwind's built-in `animate-spin` applies a 1s linear infinite rotation.

---

## Custom Scrollbar

```css
@media (hover: hover) and (pointer: fine) {
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #faf5ee; }
  ::-webkit-scrollbar-thumb { background: #d4b96a; border-radius: 99px; }
}
```

The media query `(hover: hover) and (pointer: fine)` targets mouse/trackpad users only. Touch devices (phones, tablets) match `(hover: none) and (pointer: coarse)` and get the native overlay scrollbar. This prevents the custom scrollbar from appearing on mobile where it would look wrong.

The scrollbar is 5px wide, gold-400 colored, with fully rounded thumb (`border-radius: 99px` is a large enough value to be fully round regardless of scrollbar size).

---

## Z-Index Stack

From highest to lowest:

| Layer | z-index | Element |
|---|---|---|
| Mobile nav drawer | `z-[100]` | `Navbar` mobile drawer overlay |
| Cart drawer | `z-50` | `CartDrawer` fixed overlay |
| Sticky header | `z-50` | `<header>` in Navbar |
| Zoom overlay | `z-50` | Product image zoom in `/products/[id]` |
| Mobile bottom nav | `z-40` | `MobileBottomNav` |
| Page content | default | |

The mobile drawer uses `z-[100]` instead of `z-50` because the sticky header is also `z-50` and the drawer must appear above it.
