# Placement Tracer System Design Guide

This document defines the visual language and interaction standards for the Placement Tracer System. New interfaces should follow these rules so the admin and alumni experiences remain consistent, accessible, and comfortable on desktop and mobile.

## Design direction

The interface should feel calm, trustworthy, and lightly elevated. Use cool slate surfaces, sky-blue accents, generous rounded corners, and broad diffused shadows. Borders provide structure but should not be mistaken for elevation.

Priorities:

- Make important actions and current states immediately clear.
- Keep dense administrative screens readable without feeling cramped.
- Use elevation to establish hierarchy, not decoration.
- Keep motion brief, functional, and available on touch devices.
- Preserve complete keyboard and reduced-motion support.

## Foundations

### Color

Use semantic Tailwind tokens instead of hard-coded colors whenever possible.

| Purpose           | Token               | Light theme | Dark theme  |
| ----------------- | ------------------- | ----------- | ----------- |
| Page background   | `background`        | Slate 100   | Slate 950   |
| Primary surface   | `card`              | White       | Slate 900   |
| Secondary surface | `muted` / `surface` | Light slate | Slate 800   |
| Primary text      | `foreground`        | Slate 950   | Slate 200   |
| Secondary text    | `muted-foreground`  | Slate 700   | Slate 400   |
| Primary action    | `primary`           | Sky 600     | Sky 500     |
| Primary hover     | `primary-hover`     | Sky 700     | Sky 400     |
| Focus indicator   | `ring`              | Sky 500     | Sky 500     |
| Destructive       | `destructive`       | Rose 600    | Rose 400    |
| Success           | `success`           | Emerald 700 | Emerald 400 |
| Warning           | `warning`           | Amber 800   | Amber 300   |

Color must never be the only indicator of status. Pair it with text, an icon, or both.

The settings-only color-theme preference provides Blue, Green, Purple, and Gray palettes. Every theme defines two centralized ramps: an accent ramp makes primary actions, focus, and active states pop, while an undertone ramp keeps text, supporting surfaces, borders, shadows, and inactive states legible. Blue pairs Sky accents with Slate undertones; Green pairs Emerald with Slate; Purple pairs its subdued Violet blend with Slate; Gray uses Gray for both ramps and remains achromatic. Status colors remain semantic for accessibility. Feature components must not branch on the selected palette or introduce palette-specific raw colors.

### Typography

- Primary family: Geist Sans.
- Monospace family: Geist Mono.
- Body line height: `1.5`.
- Headings use weight `600` and tight `-0.025em` tracking.
- Default body and control text should generally be `text-sm` on application screens.
- Use `text-xs` for supporting metadata, not important instructions.
- Keep headings short and use sentence case.

### Shape

The base radius is `0.625rem`.

- Small controls and compact buttons: `rounded-lg`.
- Standard inputs and buttons: `rounded-xl`.
- Field groups and secondary containers: `rounded-2xl`.
- Cards, panels, and page headers: `rounded-3xl`.
- Mobile navigation and exceptional decorative surfaces may use `rounded-4xl`.

Avoid mixing multiple radius sizes within one component unless the hierarchy clearly requires it.

### Spacing

Use Tailwind’s spacing scale. Common patterns are:

- Compact internal gap: `gap-1.5` or `gap-2`.
- Standard control grouping: `gap-3` or `gap-4`.
- Section spacing: `gap-5` or `gap-6`.
- Card padding: `p-5` on mobile and `p-6` on larger screens.
- Standard input height: `h-11`.
- Minimum comfortable touch target: `44px` (`h-11` / `min-h-11`).

## Elevation

Elevation uses wide, low-opacity shadows so surfaces appear lifted rather than outlined. Shadow values are defined globally in `app/globals.css` and automatically adapt to dark mode. Dark mode uses neutral black elevation shadows rather than palette-tinted or light shadows.

| Level     | Utility                    | Use                                        |
| --------- | -------------------------- | ------------------------------------------ |
| Resting   | `shadow-xs` / `shadow-sm`  | Inputs, small cards, embedded controls     |
| Raised    | `shadow-md`                | Elevated buttons, menus, floating controls |
| Prominent | `shadow-lg`                | Page headers and important panels          |
| Overlay   | `shadow-xl` / `shadow-2xl` | Navigation, popovers, dialogs, modals      |

Rules:

- Do not add opaque or zero-blur shadows; they look like duplicate borders.
- Use only one elevation utility per surface.
- Increase elevation by one level on hover only when the element is clickable.
- Use `shadow-none` for disabled controls.
- Keep borders subtle. A border defines an edge; a shadow communicates height.
- Borders use the settings-only Interface borders preference. This preference is independent of the light/dark color theme: each border level restores the same elements in both color modes, with only its semantic token colors adapting for contrast. `No borders` structurally removes edges with `border-style: none`; do not simulate removal with transparent colors or opacity. `Light borders` restores declared edges across inputs, buttons, cards, panels, navigation shells, tables, dividers, menus, and dialogs with one shared extra-subtle token. `Hard borders` restores the same semantic edges at the standard strength and ensures custom button-like controls participate consistently. Border and `divide-*` treatments must follow the selected visibility level.
- The Settings page groups Interface borders with Reduce motion in one Accessibility section; do not present borders as a separate top-level settings card.
- Interface border levels use a card-style ARIA radio group with full-row button hitboxes and persistent radio-circle indicators. The indicator uses a ring rather than an interface border so it remains visible when `No borders` is selected.
- In dark mode, rely on the global elevation color rather than adding pale outlines.

## Components

### Buttons

- Use the shared `Button` component for new actions.
- Primary page actions use `default`. It includes the standard primary color and restrained elevation.
- Secondary actions use `secondary` or `outline`. The `outline` variant includes the standard subtle elevation.
- Low-emphasis actions use `ghost`; use `plain` only when the surrounding surface already supplies the hover treatment.
- Destructive actions must use `destructive` and require confirmation when data loss is possible.
- Reserve `success` for confirmed positive/export actions, `inverse` for controls on dark or primary surfaces, `link` for text-like actions, and the navigation variants for dashboard navigation only.
- Do not introduce elevated aliases or one-off visual variants. Compose spacing with an existing size and semantic variant.
- Icon-only buttons require an accessible label.
- Buttons use color, border, shadow, and a one-pixel press translation for feedback. Do not scale the control or its icon.
- Disabled buttons must not animate or respond to pointer input.

### Iconography

- Import application icons from `components/ui/icons.tsx`; feature components must not import AnimateIcons or Lucide directly.
- Use the animated Lucide mapping when it exists. Static Lucide fallbacks are acceptable for unsupported or intentionally decorative glyphs.
- The Google sign-in mark is a brand asset and is exempt from the system-icon mapper.
- Use chevrons for navigation, disclosure, progression, and directional affordances. Do not use arrow glyphs for these purposes.
- Structural and decorative icons remain static. Animate action icons only when motion confirms the associated interaction or state.
- Button and icon-link animations use the complete control hitbox, including keyboard focus and touch press. Never bind essential feedback only to the SVG itself.
- Keep icon animation subtle and icon-specific. Do not add generic hover or active scale transforms.
- Mark mapped icons with the shared system-icon behavior so the local Reduce Motion preference can stop both wrapper and internal SVG transforms.

### Inputs and selection controls

- Use a muted or background surface, a one-pixel semantic border, and `inset-shadow-sm`. Inputs must read as recessed controls and must not use outer elevation shadows.
- Hover may strengthen the border only on devices that support hover.
- Focus uses the semantic ring and must remain visibly distinct from hover.
- Error states combine destructive color, an error message, and appropriate ARIA attributes.
- Labels remain outside the interactive hitbox; controls themselves must retain direct pointer input.
- Do not remove outlines without replacing them with an equally visible focus ring.

### Cards and panels

- Use `bg-card`, `border-border`, `rounded-3xl`, and an appropriate elevation level.
- Keep cards static unless the complete card is interactive.
- Interactive cards may subtly raise or change surface color on hover and should show press feedback on touch.
- Avoid nesting several elevated cards. Inner groups should usually use `bg-muted` with little or no shadow.

### Tables and data lists

- Table rows use a subtle background transition on hover.
- Data lists use centralized `data-hover` and `data-header` surfaces. In both color modes, hover is the lightest layer, the header is slightly darker than hover, and the page background is darker than the header.
- Row actions must remain individually tappable and must not trigger the row accidentally.
- When a file row's full surface is the primary open hitbox, keyboard focus for its semantic open control is rendered on that same outer row; selection and overflow-menu controls retain independent focus.
- On narrow screens, favor stacked content, horizontal scrolling, or purpose-built mobile rows over squeezed columns.
- Preserve clear selected, loading, empty, and error states.

### Navigation

- Desktop navigation is fixed and may use `shadow-xl` to separate it from content.
- Mobile navigation is fixed to the bottom and accounts for the safe-area inset.
- Active destinations use both color and a visible surface treatment.
- Navigation separates the two ramps: inactive text uses undertone 500 and active text uses accent 700 in light mode (for example, Slate 500 and Sky 700). Dark mode uses undertone 400 and accent 300 for equivalent contrast. Active destinations also retain their accent surface treatment.
- Navigation icons use the same full-hitbox animation behavior as buttons on desktop, keyboard, and touch input.
- Sidebar navigation uses inset focus rings so scroll and clipping boundaries never crop the indicator.
- Navigation press feedback must work without hover and must not scale the item or icon.
- Avoid motion that shifts the page content unexpectedly.

### Dialogs, menus, and toasts

- Modals use the highest elevation and a dimmed semantic overlay.
- Menus use `shadow-md` or `shadow-xl`, depending on size and stacking context.
- Animate overlays with short fade and scale transitions around their transform origin.
- Toasts should be brief, readable, and centered within the viewport on small screens.
- Never rely on a toast as the only record of a critical failure.

## Micro-interactions

Micro-interactions should confirm an action or clarify state. They should not delay the user.

- Standard duration: `180–200ms`.
- Page entrance: approximately `240ms`.
- Toast entrance and exit: approximately `300ms`.
- Default easing: `ease-out` for entrances and responsive control feedback.
- Pressed controls may translate down `1px`; do not scale them.
- Icons must not use generic scale-up or press-compression effects. Use the mapped icon's restrained, semantic animation where appropriate.
- Disclosure chevrons rotate when expanded.
- Loading progress may animate width; avoid indefinite decorative animation.
- Use hover effects only inside `(hover: hover) and (pointer: fine)` when writing custom CSS.
- Every essential hover response needs an equivalent focus, active, or persistent state for mobile and keyboard use.

Respect both `prefers-reduced-motion` and the in-app Reduce Motion preference. The shared preference store, icon mapper, and global stylesheet must stop running icon animations and remove transforms from mapped icons immediately.

## Responsive behavior

Design mobile-first, then add complexity at larger breakpoints.

- Controls should be reachable and at least `44px` tall where practical.
- Do not require hover to discover or perform an action.
- Use `touch-action: manipulation` on interactive controls.
- Avoid horizontal page overflow.
- Allow button labels to wrap rather than overflow.
- Keep primary actions visible without covering content or device safe areas.
- Stack page headers and action groups on mobile; align them horizontally from `md` when space allows.
- Test dialogs, menus, forms, tables, and bottom navigation at narrow widths.

## Accessibility

- Maintain semantic HTML before adding ARIA roles.
- All interactive elements must be keyboard reachable.
- Focus indicators must remain visible against both themes.
- Provide accessible names for icon-only controls.
- Associate form errors and descriptions with their controls.
- Maintain sufficient color contrast for text, icons, borders, and focus rings.
- Use live regions sparingly for asynchronous status updates.
- Preserve reduced-motion behavior and avoid flashing animation.

## Implementation checklist

Before merging a UI change, confirm that:

- Semantic theme tokens are used instead of raw colors.
- Elevation matches the surface’s hierarchy.
- Shadows are broad and subtle, not border-like.
- Hover, keyboard focus, active press, disabled, loading, and error states are covered.
- Essential feedback works on touch devices.
- Icons are imported through the shared mapper, and intentional icon animation uses the complete control hitbox.
- No generic icon or control scale transforms are present.
- Minimum touch targets and safe areas are respected.
- Light and dark themes are both legible.
- Reduced-motion behavior remains usable.
- The shared component primitives are used where available.
- Formatting, linting, TypeScript, and the production build pass.
