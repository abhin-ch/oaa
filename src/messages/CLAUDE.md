# src/messages/

## Purpose

Internationalization string files for English and French. Used by `next-intl` to render all user-facing text.

## Files

- `en.json` — English strings
- `fr.json` — French strings

## Conventions

1. **Namespaced keys** — Organized by feature/page: `"wizard.step1.title"`, `"results.teui.label"`, `"common.save"`.
2. **Flat within namespaces** — Use dot notation in code (`useTranslations('wizard.step1')`) but the JSON is nested:
   ```json
   {
     "wizard": {
       "step1": {
         "title": "Project Setup",
         "description": "Enter your building's basic information"
       }
     }
   }
   ```
3. **Both files must have identical keys** — Every key in `en.json` must exist in `fr.json` and vice versa. Missing keys will show the key path as fallback (ugly).
4. **Interpolation** — Use ICU message format for dynamic values: `"Your TEUI is {value} kWh/m²/yr"`.
5. **Plurals** — Use ICU plural syntax: `"{count, plural, one {# project} other {# projects}}"`.
6. **Technical terms stay English** — TEUI, TEDI, GHGI, HDD, CDD, kWh, m², CO₂ are domain-standard and should not be translated.
7. **No HTML in strings** — Use rich text formatting via `next-intl`'s `<bold>` / `<link>` tags if needed.

## Adding New Strings

1. Add the key + English text to `en.json`
2. Add the same key + French translation to `fr.json`
3. Use `useTranslations('namespace')` in the component
4. Never use `t()` with a string literal that isn't in the JSON files

## Status

- [ ] Initial namespace structure defined
- [ ] Common strings (nav, buttons, errors)
- [ ] Wizard step strings (all 7 steps)
- [ ] Results/dashboard strings
- [ ] Accessibility strings (aria-labels, announcements)
