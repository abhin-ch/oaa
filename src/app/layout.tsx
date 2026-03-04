// Root layout is intentionally minimal.
// All i18n, fonts, and theming are handled in [locale]/layout.tsx.
// This file exists only because Next.js requires a root layout.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
