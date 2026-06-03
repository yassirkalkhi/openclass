# Internationalization (i18n) Guide

OpenClass now supports multiple languages with full RTL (Right-to-Left) support for Arabic.

## Supported Languages

- **English** (en) - Default
- **French** (fr)
- **Arabic** (ar) - with RTL support

## How It Works

### 1. Cookie-Based Persistence

The user's language preference is stored in a cookie named `NEXT_LOCALE`. This ensures:
- Language persists across sessions
- Works on both client and server
- No flash of wrong language on page load

### 2. React Context

The `I18nProvider` wraps the entire app and provides:
- Current locale
- Translation object
- Function to change locale
- RTL/LTR direction state

### 3. Automatic RTL Support

When Arabic is selected:
- `dir="rtl"` is applied to `<html>`
- CSS automatically flips layouts
- Text alignment is reversed

## Usage

### Basic Usage with useTranslation Hook

```tsx
"use client"

import { useTranslation } from "@/lib/i18n/context"

export function MyComponent() {
  // Get translations for a specific namespace
  const { t: common } = useTranslation("common")
  const { t: nav } = useTranslation("nav")
  
  return (
    <div>
      <h1>{common.loading}</h1>
      <button>{common.save}</button>
      <nav>
        <a>{nav.home}</a>
        <a>{nav.classes}</a>
      </nav>
    </div>
  )
}
```

### Full i18n Context

```tsx
"use client"

import { useI18n } from "@/lib/i18n/context"

export function MyComponent() {
  const { locale, t, setLocale, isRTL } = useI18n()
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <p>Is RTL: {isRTL ? "Yes" : "No"}</p>
      <button onClick={() => setLocale("fr")}>
        Switch to French
      </button>
      <h1>{t.common.loading}</h1>
    </div>
  )
}
```

### Language Switcher

The `LanguageSwitcher` component is already integrated in the global header:

```tsx
import { LanguageSwitcher } from "@/components/ui/language-switcher"

<LanguageSwitcher />
```

## Adding New Translations

### 1. Add to English (source)

Edit `src/lib/i18n/locales/en.ts`:

```ts
export const en = {
  // ... existing translations
  
  myNewSection: {
    title: "My Title",
    description: "My Description",
    action: "Click Me",
  },
}
```

### 2. Add to French

Edit `src/lib/i18n/locales/fr.ts`:

```ts
export const fr: TranslationKeys = {
  // ... existing translations
  
  myNewSection: {
    title: "Mon Titre",
    description: "Ma Description",
    action: "Cliquez-moi",
  },
}
```

### 3. Add to Arabic

Edit `src/lib/i18n/locales/ar.ts`:

```ts
export const ar: TranslationKeys = {
  // ... existing translations
  
  myNewSection: {
    title: "عنواني",
    description: "وصفي",
    action: "انقر هنا",
  },
}
```

## RTL-Specific Styling

### Automatic Flips

Most layouts flip automatically with `dir="rtl"`. For manual control:

```tsx
// Mirror icons in RTL
<ChevronRight className="rtl:mirror" />

// Rotate 180° in RTL
<ArrowRight className="rtl:rotate-180" />
```

### CSS Classes

```css
/* Applied automatically in RTL */
[dir="rtl"] .ml-auto {
  margin-left: 0 !important;
  margin-right: auto !important;
}

[dir="rtl"] .text-left {
  text-align: right;
}
```

### Custom RTL Styles

```tsx
<div className={cn(
  "ml-4",
  isRTL && "mr-4 ml-0"
)}>
  Content
</div>
```

## Server-Side Usage

For server components, read the locale from cookies:

```tsx
import { cookies } from "next/headers"
import { getLocaleFromCookieHeader } from "@/lib/i18n/cookies"
import { locales } from "@/lib/i18n/locales"

export default async function MyServerComponent() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookieHeader(cookieStore.toString())
  const t = locales[locale]
  
  return <h1>{t.common.loading}</h1>
}
```

## API

### useI18n()

Returns the full i18n context:

```ts
{
  locale: Locale           // Current locale: "en" | "fr" | "ar"
  t: Translations          // Full translation object
  setLocale: (Locale) => void  // Change language
  isRTL: boolean           // Is current language RTL
}
```

### useTranslation(namespace)

Returns translations for a specific namespace:

```ts
{
  t: NamespaceTranslations  // Translations for namespace
  locale: Locale
  setLocale: (Locale) => void
  isRTL: boolean
}
```

### Cookie Functions

```ts
// Client-side
getLocaleFromCookie(): Locale
setLocaleCookie(locale: Locale): void

// Server-side
getLocaleFromCookieHeader(cookieHeader: string): Locale
```

## Translation Structure

```
src/lib/i18n/
├── locales/
│   ├── en.ts          # English (source)
│   ├── fr.ts          # French
│   ├── ar.ts          # Arabic
│   └── index.ts       # Exports and types
├── cookies.ts         # Cookie utilities
└── context.tsx        # React Context provider
```

## Best Practices

1. **Always use translation keys** - Never hardcode text
2. **Keep keys organized** - Use namespaces (common, nav, auth, etc.)
3. **Test in all languages** - Especially RTL
4. **Consider text length** - Translations can be longer/shorter
5. **Use semantic keys** - `auth.login` not `auth.button1`
6. **Add new keys to all languages** - Keep translations in sync

## Common Patterns

### Conditional Text

```tsx
const { t: common, locale } = useTranslation("common")

<p>
  {locale === "ar" ? "مرحبا" : common.loading}
</p>
```

### Dynamic Content

```tsx
const { t: assignments } = useTranslation("assignments")

<p>
  {assignments.status}: {assignment.status}
</p>
```

### Pluralization (Manual)

```tsx
const { t: chat } = useTranslation("chat")

<p>
  {count} {count === 1 ? "reply" : chat.replies}
</p>
```

## Troubleshooting

### Language not changing

1. Check cookie is being set: `document.cookie`
2. Verify page reload after language change
3. Check browser console for errors

### RTL not working

1. Verify `dir="rtl"` on `<html>` element
2. Check CSS is loaded
3. Test with `isRTL` from context

### Missing translations

1. Check TypeScript errors
2. Verify key exists in all locale files
3. Ensure proper import of translation files

## Future Enhancements

- [ ] Add more languages (Spanish, German, etc.)
- [ ] Implement pluralization library
- [ ] Add date/time formatting per locale
- [ ] Number formatting per locale
- [ ] Translation management UI
- [ ] Automatic translation suggestions
