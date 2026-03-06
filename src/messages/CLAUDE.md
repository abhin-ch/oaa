# src/messages/

## Purpose

i18n string files for next-intl. English and French.

## Files

- `en.json` — English strings
- `fr.json` — French strings

## Conventions

1. Nested JSON by namespace: `common`, `nav`, `meta`, `landing`, `buildings`, `catalog`, `calculators`, `teui1`, `units`, `a11y`, `errors`
2. Both files must have identical key structure
3. ICU message format for interpolation: `{value}`, `{count, plural, ...}`
4. Technical terms stay English: TEUI, TEDI, GHGI, kWh, m2, CO2
5. No HTML in strings
6. Use `useTranslations('namespace')` in components
