# Copilot Working Preferences (Token-Saving)

## Default style
- Keep responses short and implementation-first.
- Do the edit directly; avoid long planning text unless blocked.
- Batch related edits together.
- After edits, run a quick error check on touched files.

## Project preferences
- Stack: Angular + SCSS.
- Prefer reusable components for repeated UI.
- Put reusable UI pieces under `src/app/shared/components`.
- Put reusable models under `src/app/shared/models`.
- Put reusable global styles under `src/assets/scss/components`.
- Reuse existing tokens/variables/classes before adding new patterns.

## Naming convention
- Use BEM for component-scoped classes.
- Pattern: `cap-{component}` and `cap-{component}__{element}`.
- Example: `cap-navbar`, `cap-navbar__logo`, `cap-navbar__links`, `cap-navbar__link`.
- SCSS structure: nest under the block using `&__element` (e.g. `.cap-navbar { &__logo {} &__links {} }`).
- Avoid generic class names (`.nav-link`, `.card-title`) in component styles.

## UI preferences
- Avoid placeholders when asked for final UI content.
- For car cards/images, use model-accurate assets.
- Ensure mobile responsiveness for hero overlays/cards/floating notes.
- Keep visual hierarchy clear (important values should stand out).

## Routing/assets preferences
- Use existing Angular routing conventions in `public-routing.module.ts`.
- Use stable asset paths aligned with current config.

## Loading/async UI pattern
- For buttons with async actions, add a spinner icon instead of changing button text.
- Pattern: `<i class="fa fa-spin fa-spinner me-2" *ngIf="loading"></i>` inside the button, alongside the static label.
- Keep the button label unchanged; only the spinner appears/disappears.
- Use `[disabled]="loading"` on the button to prevent double-submit.

## SSR/hydration safety
- Prefer SSR-safe template patterns.
- If using libraries that mutate DOM, avoid hydration mismatches.

## Quick request templates (for user)
Use one-liners like:
- `Implement [feature] in [page/component]. Extract reusable parts to shared.`
- `Refactor [section] into component + model. Keep existing style.`
- `Fix responsive issue: [problem]. Target: mobile/tablet/desktop.`
- `Polish UI: make [element] stand out. Minimal visual changes.`
- `Replace placeholders with real/model-accurate content.`
- `Do only this file: [path]. Keep response concise.`

## Output preferences
- Return: changed files + 1-2 line summary.
- Skip long explanations unless requested.
