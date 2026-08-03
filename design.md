# Placement Tracer System Design Guide

This is the design contract for the Placement Tracer System. It documents the implemented visual language, interaction behavior, responsive patterns, accessibility rules, and reusable component boundaries. New work should look and behave like part of the same system for administrators, coordinators, and alumni.

The implementation sources of truth are:

- `app/globals.css` for semantic tokens, themes, elevation, focus, control surfaces, and motion overrides.
- `components/ui` for reusable interactive and presentation primitives.
- `components/ui/button-variants.ts` for button semantics and sizes.
- `components/ui/icons.tsx` for application icon mapping and interaction animation.
- `components/layout/DashboardNavigation.tsx` for desktop/mobile navigation patterns.
- `components/settings/ColorThemePreference.tsx`, `ThemeToggle.tsx`, and `MotionPreference.tsx` for local display preferences.

If this guide and the implementation disagree, confirm the intended behavior, update the shared primitive or token first, and update this guide in the same change. Do not solve inconsistencies with one-off feature styles.

## Design direction

The product should feel calm, trustworthy, clear, and lightly elevated. Administrative screens can be information-dense, but should never feel cramped or visually noisy. Alumni workflows should feel guided and forgiving without hiding important status or consequences.

Priorities, in order:

1. Make the current state and next useful action obvious.
2. Preserve complete keyboard, screen-reader, touch, and reduced-motion use.
3. Keep data-heavy screens readable at desktop and mobile widths.
4. Use semantic color, shape, and elevation consistently.
5. Use brief motion to confirm interaction, never to delay it.

## Foundations

### Semantic color

Feature code should use semantic Tailwind utilities such as `bg-card`, `text-foreground`, `border-border`, and `text-destructive`. Raw palette utilities are reserved for the centralized theme/token implementation and exceptional semantic data visualization.

| Purpose           | Semantic token      | Default light          | Default dark           |
| ----------------- | ------------------- | ---------------------- | ---------------------- |
| Page background   | `background`        | Slate 100              | Slate 950              |
| Primary surface   | `card`              | White                  | Slate 900              |
| Secondary surface | `muted` / `surface` | Light slate            | Slate 800              |
| Primary text      | `foreground`        | Slate 950              | Slate 200              |
| Secondary text    | `muted-foreground`  | Slate 700              | Slate 400              |
| Primary action    | `primary`           | Sky 700                | Sky 500                |
| Primary hover     | `primary-hover`     | Sky 800                | Sky 400                |
| Focus indicator   | `ring`              | Sky 700                | Sky 500                |
| Destructive       | `destructive`       | Rose 600               | Rose 400               |
| Success           | `success`           | Emerald 700            | Emerald 400            |
| Warning           | `warning`           | Amber 800              | Amber 300              |
| Data-list hover   | `data-hover`        | Lightest data layer    | Slate 800              |
| Data-list header  | `data-header`       | Above page/below hover | Above page/below hover |
| Dimmed backdrop   | `overlay`           | 40% black mix          | 60% black mix          |

Color must never be the only carrier of status. Pair status color with a label, icon, shape, or explanatory text. Do not use success/destructive colors decoratively.

### Color themes

The device-local color preference changes the accent and supporting undertone ramps without changing layout or behavior.

| User-facing theme | Stored value         | Accent ramp | Undertone ramp |
| ----------------- | -------------------- | ----------- | -------------- |
| Blue              | default/no attribute | Sky         | Slate          |
| Green             | `green`              | Emerald     | Olive          |
| Fuchsia           | `purple`             | Fuchsia     | Mauve          |
| Gray              | `gray`               | Gray        | Gray           |

The Fuchsia setting intentionally keeps the stored value `purple` for backward compatibility. The preference key is `tracer-color-theme` and the root attribute is `data-color-theme`.

Theme rules:

- Light primary actions use accent 700, accent 800 on hover, and white text.
- Dark primary actions use accent 500, accent 400 on hover, and undertone 950 text.
- Light focus uses accent 700; dark focus uses accent 500.
- The accent ramp owns actions, focus, active navigation, and recognizable themed hover.
- The undertone ramp owns page/card/supporting surfaces, neutral text, borders, and elevation tint.
- Status colors remain semantic and do not change with the selected accent.
- A theme change must not alter spacing, component structure, copy, validation, or application behavior.
- Feature components must not branch on the selected palette.

### Light and dark mode

Light/dark preference is stored at `tracer-theme` as `light`, `dark`, or system behavior. The root `.dark` class switches semantic values. Theme bootstrap runs before hydration in `app/layout.tsx` to avoid a visible incorrect-theme flash.

Test every new surface in:

- Blue light and dark.
- Gray light and dark because it has explicit overrides.
- At least one colored alternative (Green or Fuchsia) in light and dark.
- Windows high-contrast/forced-colors mode when the control is custom.

### Typography

- Sans family: `--font-system-sans`.
- Monospace family: `--font-system-mono`.
- Body line height: `1.5`.
- Application body/control text: normally `text-sm`.
- Supporting metadata: `text-xs`; do not use it for essential instructions.
- Page headings: concise sentence case, weight 600, tight `-0.025em` tracking.
- Avoid all caps for ordinary labels. Preserve familiar acronyms such as CSV, ID, or ParSU.
- Use tabular numerals where fast comparison of counts/dates benefits.

### Shape

The base radius is `0.625rem`.

| Shape         | Typical use                                                  |
| ------------- | ------------------------------------------------------------ |
| `rounded-lg`  | Compact controls and buttons.                                |
| `rounded-xl`  | Standard inputs and buttons.                                 |
| `rounded-2xl` | Field groups and secondary containers.                       |
| `rounded-3xl` | Cards, panels, and page headers.                             |
| `rounded-4xl` | Mobile navigation and exceptional large decorative surfaces. |

Avoid mixing several radii inside a component. Nested surfaces should usually become less rounded and less elevated as they move inward.

### Spacing and sizing

Use Tailwind's spacing scale.

- Compact internal gap: `gap-1.5` or `gap-2`.
- Standard control grouping: `gap-3` or `gap-4`.
- Section spacing: `gap-5` or `gap-6`.
- Card padding: normally `p-5` on mobile and `p-6` at larger widths.
- Standard input/combobox: `h-11`.
- Default button: `h-10`; use `lg`/`h-11` for primary touch-heavy actions.
- Comfortable touch target: at least 44 by 44 pixels where practical.
- Page content must account for the fixed desktop sidebar or mobile bottom navigation and safe-area inset.

Do not make controls visually smaller by shrinking text below readable sizes. For dense tables, reduce surrounding whitespace before reducing hit targets.

## Elevation and borders

Elevation uses broad, low-opacity shadows defined in `app/globals.css`. Dark mode uses a neutral-black elevation color. Borders define edges; shadows communicate height.

| Level     | Utility                    | Use                                              |
| --------- | -------------------------- | ------------------------------------------------ |
| Resting   | `shadow-xs` / `shadow-sm`  | Small cards, subtle controls, embedded surfaces. |
| Raised    | `shadow-md`                | Primary buttons, menus, floating controls.       |
| Prominent | `shadow-lg`                | Page headers and important panels.               |
| Overlay   | `shadow-xl` / `shadow-2xl` | Fixed navigation, popovers, dialogs, sheets.     |

Rules:

- Use one elevation utility per surface.
- A clickable surface may rise by one level on hover-capable devices.
- Disabled controls use `shadow-none` where a shadow would imply interactivity.
- Never use opaque or zero-blur shadows as duplicate borders.
- Structural borders use the subtle semantic `border`/`input` tokens.
- Strong ring and destructive colors are reserved for focus, validation, or meaningful status.
- Inputs are recessed with an inset shadow; they do not receive outer elevation.
- Nested cards should usually become `bg-muted` groups with little or no shadow.

## Layout patterns

### Application shell

- Desktop uses fixed side navigation and an independently scrolling content region.
- Mobile uses fixed bottom navigation with safe-area padding and a More sheet/menu where needed.
- The root page reserves a stable scrollbar gutter so content does not jump as height changes.
- Main content should have a readable maximum width when it is form/content oriented; data screens may use the available width.
- Avoid global horizontal overflow. Local table/file scrollers are acceptable when clearly bounded.

### Page header

A standard application page begins with:

1. A short `h1` describing the current resource or task.
2. Optional one-line supporting text.
3. Primary actions aligned to the right from `md`, stacked below on mobile.
4. Filters or summary metrics in a distinct following region.

Do not place several equally prominent primary actions in one header. Choose the most useful next action; render others as secondary/outline/menus.

### Dashboard

- Lead with current context and the most useful action.
- Metrics should use consistent cards and plain-language labels.
- Charts require a text label/summary and must not be the only representation of critical data.
- Recent lists need explicit loading, empty, error, and view-all behavior.

### Forms and multi-step workflows

- Group fields by user goal, matching the built-in tracer sections.
- Keep labels outside controls and descriptions/errors associated through HTML/ARIA.
- Show conditional fields only when relevant, but preserve user input when a reversible choice temporarily hides it unless domain rules require clearing.
- Keep current step, progress, save state, and submission state visible.
- Warn before navigation when changes are unsaved.
- Draft save and final submit must have visually and verbally distinct actions.
- Validation should place a message near the field and a useful summary/step cue when the error is off-screen.
- Do not permit a loading state to erase entered content.

### Tables and data lists

- Use shared table primitives and centralized `data-header`/`data-hover` surfaces.
- The header is darker than the hover layer but lighter than the page in both modes.
- Keep sortable headers keyboard operable and expose sort direction.
- Row actions have independent hit targets and must not accidentally trigger the row.
- When a full file row is the open target, render its keyboard focus on the outer row; selection and overflow actions keep independent focus.
- Preserve selected, loading, empty, partial, and error states.
- At narrow widths, use horizontal scrolling, stacked mobile rows, or hide genuinely secondary columns. Never squeeze controls into unusable widths.
- Pagination/filter changes should not unexpectedly jump focus or discard a user's search context.

## Components

Use the shared primitive that already owns the behavior. Feature code may add layout classes such as width, grid placement, or outer margin; it should not restate a primitive's background, border, radius, padding, shadow, or focus ring.

### Buttons and button-like links

Use `Button` for actions and `IconLink`/`buttonVariants` for navigation that must share the visual language.

| Variant                            | Meaning                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `default`                          | Primary page/task action.                                                   |
| `outline`                          | Bordered secondary action on ordinary surfaces.                             |
| `secondary`                        | Secondary action with filled neutral surface.                               |
| `ghost`                            | Low-emphasis action that reveals a hover/active surface.                    |
| `plain`                            | Transparent action when the surrounding component supplies state treatment. |
| `destructive`                      | Potentially destructive action; pair irreversible loss with confirmation.   |
| `success`                          | Confirmed positive/export action; use sparingly.                            |
| `inverse`                          | Control placed on dark/primary surfaces.                                    |
| `link`                             | Text-like action within prose or compact supporting content.                |
| `navigation` / `navigation-active` | Dashboard navigation only.                                                  |

Button rules:

- `Button` defaults to a ghost style when no semantic variant is supplied; specify `default` for a primary action.
- Do not invent elevated/color aliases for a single screen.
- Use an existing size for density/layout; feature code should not reconstruct internal padding.
- Icon-only buttons require an accessible label and a clear tooltip/adjacent context when the icon is unfamiliar.
- Buttons use color, border, shadow, and a one-pixel press translation; never scale the control or icon.
- Disabled buttons do not animate or respond to pointer input.
- Destructive actions explain the object and consequence; material data loss requires the shared confirmation dialog.
- Use a semantic link for navigation, never an imperative button with `router.push` solely to imitate a link.

### Iconography

- Import application icons from `components/ui/icons.tsx`.
- Feature components must not import AnimateIcons or Lucide directly unless the icon is an unsupported, intentional static fallback.
- The Google sign-in mark is a brand asset and is exempt.
- Chevrons communicate navigation, disclosure, progress, and direction. Avoid arrow glyphs for those established cases.
- Structural/decorative icons remain static.
- Action icon motion must confirm its action and activate from the complete control hitbox on hover, focus, and touch.
- Do not bind essential feedback to the SVG element alone.
- Do not add generic icon hover scale or press compression.
- Mapped icons carry shared system-icon behavior so both OS and in-app reduced-motion settings can stop internal transforms.

### Inputs and selection controls

- Use `Input`, `Combobox`, and `Checkbox` instead of local native-control recipes.
- Controls use background/muted surfaces, a one-pixel semantic border, and `inset-shadow-sm`.
- Hover may strengthen a border only inside `(hover: hover) and (pointer: fine)`.
- Focus uses a full-opacity semantic ring and remains distinct from hover.
- Error state combines destructive styling, explanatory text, `aria-invalid`, and appropriate description linkage.
- Labels remain outside the interactive hitbox.
- Do not remove a native outline without an equal or stronger visible focus treatment.
- Placeholders are examples/hints, not replacements for labels or persisted values.

### Cards and panels

- Standard card recipe is `bg-card border-border rounded-3xl` with elevation appropriate to hierarchy.
- A static card stays static on hover.
- A fully interactive card may subtly change surface/elevation and must be keyboard/semantically interactive as a whole.
- Avoid nesting multiple raised cards. Use muted inner groups and section dividers.
- Keep the entire important title and action visible; do not clip focus rings at card boundaries.

### Status, loading, empty, and error states

- Loading states should preserve the surrounding layout and describe what is loading when delay is noticeable.
- Use `LoadingState`, table content state, or a component-specific skeleton; avoid indefinite decorative spinners without context.
- Empty states distinguish "no records exist" from "no records match these filters" and offer the appropriate next action.
- Error states describe what failed, preserve recoverable input, and offer retry/navigation where useful.
- Never rely on a toast as the only record of a critical failure.
- Background lifecycle failures (Drive organization, import, deletion) must remain visible in persistent record status.

### Dialogs, sheets, menus, and toasts

- Use the shared modal, form modal, confirmation dialog, action menu, and toast primitives.
- Modals use the highest elevation and a dimmed semantic overlay.
- Centered dialogs are appropriate for focused confirmation/editing; bottom placement is appropriate for mobile navigation/action sheets.
- Initial focus, focus containment, Escape behavior, accessible title/description, and focus return must remain intact.
- Pages reserve a stable scrollbar gutter. Modal locking measures the root gutter, substitutes page-only right padding, locks root overflow, and retains compensation through exit animation.
- Menus use raised/overlay elevation and close after selection, Escape, or outside interaction as appropriate.
- Toasts are brief, readable, and centered within the small-screen viewport. Use them for acknowledgement, not for durable failure state.

### File upload and file browser

- Show allowed types and the 10 MB limit before selection.
- Display filename, progress/state, retry, and delete affordances without relying on color.
- Do not imply completion until direct upload finalization has committed metadata.
- File-row selection, open, preview, and overflow actions must remain independent and keyboard operable.
- Destructive folder/file actions name the target and use confirmation.
- Preview failures should retain file metadata and offer download/retry where possible.

## Navigation

- Desktop navigation is fixed and may use `shadow-xl` for separation.
- Mobile navigation is fixed to the bottom and includes `env(safe-area-inset-bottom)`.
- Active destinations use both themed color and a persistent surface.
- Inactive navigation uses undertone 500 light/400 dark; active uses accent 700 light/300 dark.
- Navigation hover uses `primary/10` plus active-colored text across the sidebar, secondary controls, mobile items, More control, and More menu links.
- Sidebar focus rings are inset so scroll/clipping boundaries cannot crop them.
- Press feedback works on touch and never scales the item or icon.
- Role-specific destinations must not flash briefly to unauthorized users while verified access is loading.

## Motion and feedback

Motion confirms input or explains state change. It should never block work.

| Interaction           | Guidance                                                       |
| --------------------- | -------------------------------------------------------------- |
| Standard control      | 180–200 ms, responsive ease-out.                               |
| Page entrance         | About 240 ms.                                                  |
| Toast enter/exit      | About 300 ms.                                                  |
| Touch icon completion | Briefly finish, approximately 350 ms maximum.                  |
| Press                 | Translate down 1 px; no scale.                                 |
| Disclosure            | Rotate the chevron.                                            |
| Progress              | Animate meaningful width/state change; avoid ornamental loops. |

Respect both `prefers-reduced-motion: reduce` and the application preference stored at `tracer-reduce-motion`. The root `data-reduce-motion` state and global CSS must stop mapped icon animation and remove nonessential transforms immediately. Reduced motion is not "no feedback": preserve color, border, copy, and state changes.

## Responsive behavior

Design mobile first, then add density at larger breakpoints.

- Core actions must work without hover.
- Use `touch-action: manipulation` on interactive controls where the shared primitive does not already supply it.
- Keep controls at least 44 pixels in touch-heavy contexts.
- Allow labels/buttons to wrap when the alternative is clipping.
- Stack page headers and action groups on mobile, aligning horizontally from `md` when space permits.
- Mobile fixed navigation and sheets must respect safe areas and must not cover page actions/content.
- Test at approximately 320, 375, 768, 1024, and 1440 CSS pixels, plus 200% browser zoom.
- Test long names, email addresses, program titles, translated/expanded text, and empty values.
- Tables may scroll locally; the page itself should not acquire accidental horizontal scroll.

## Accessibility

WCAG 2.2 AA is the target for core flows.

- Prefer semantic HTML before ARIA.
- Every action is keyboard reachable and has a visible focus indicator.
- DOM/focus order follows the visual reading order.
- Icon-only controls have accessible names.
- Form labels, descriptions, requirements, and errors are programmatically associated.
- Status is never color-only; contrast remains sufficient in every palette/mode.
- Touch targets are comfortably sized and not crowded.
- Live regions are used sparingly for meaningful asynchronous updates.
- Dialogs and menus correctly manage focus and Escape.
- Charts have text equivalents and do not encode categories by indistinguishable colors alone.
- Reduced-motion users retain understandable state feedback.
- Destructive confirmation does not rely on memory alone; the target/action remains visible.
- Authentication, survey completion, upload, and administrative actions must remain usable at 200% zoom.

## Content and tone

- Use plain, respectful, action-oriented language.
- Address the user directly when helpful; avoid blaming language in errors.
- Button labels describe the action: "Save draft", "Submit response", "Delete study".
- Name the affected object in destructive dialogs.
- Explain recovery: what happened, what was preserved, and what the user can do next.
- Keep administrative terminology consistent: account, study, response, document, program, coordinator, administrator, alumni.
- Use "sign in" and "sign out" as verbs; avoid mixing "log in" terminology.
- Dates should include enough context to avoid ambiguity; academic years use `YYYY-YYYY`.
- Do not expose internal lifecycle/database terms unless they help staff resolve a failure.

## Page/state acceptance matrix

Every new page or major feature should be reviewed in these states as applicable:

| Dimension  | States to verify                                                                  |
| ---------- | --------------------------------------------------------------------------------- |
| Data       | Loading, populated, empty, filtered-empty, partial, failed, retrying.             |
| Permission | Admin, scoped coordinator, unscoped/denied, alumni/owner, signed out.             |
| Form       | Pristine, changed, saving, saved, invalid, stale conflict, submitting, submitted. |
| Lifecycle  | Open, closed, archived, importing, organizing, deleting, failed/retryable.        |
| Theme      | Light/dark × Blue/Green/Fuchsia/Gray.                                             |
| Input      | Mouse, keyboard, touch, screen reader.                                            |
| Motion     | Normal, OS reduced motion, in-app reduced motion.                                 |
| Width      | Narrow phone, phone, tablet, desktop, wide desktop, 200% zoom.                    |

## Implementation checklist

Before merging a UI change, confirm:

- Semantic tokens are used instead of raw feature-level palette colors.
- Accent and undertone responsibilities remain separate in every theme.
- Shared primitives own control appearance and behavior.
- Feature code has not duplicated button, input, combobox, checkbox, modal, or table recipes.
- The chosen button variant communicates action hierarchy and primary actions specify `default`.
- Elevation matches hierarchy; shadows are broad/subtle and borders remain structural.
- Hover, focus, touch press, disabled, loading, empty, validation, error, and retry states are covered.
- Essential behavior is available without hover.
- Icons come from the mapper and intentional animation uses the complete hitbox.
- No generic control/icon scaling has been introduced.
- Keyboard order, focus visibility/return, accessible names, and error associations work.
- Light/dark and all color themes remain legible.
- OS and in-app reduced motion work immediately.
- Mobile safe areas, narrow widths, long content, and 200% zoom have been tested.
- Destructive actions use clear consequences and the shared confirmation flow.
- Formatting, lint, tests, and the production build pass.

When a new reusable visual behavior is needed, implement and document it in the relevant shared primitive first. When a new application-wide token is needed, define both light and dark semantics in `app/globals.css`, verify all selectable palettes, and add it to this guide.
