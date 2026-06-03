import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/theme-context";
import { I18nProvider } from "@/lib/i18n/context";
import { getLocaleFromCookieHeader } from "@/lib/i18n/cookies";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { OrganizationProvider } from "@/context/organization-context";
import { WorkspaceUIProvider } from "@/context/workspace-ui-context";

const notoSansHeading = Noto_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "openClass",
  description: "Enterprise learning and collaboration workspace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const initialLocale = getLocaleFromCookieHeader(cookieHeader)

  return (
    <html
      lang={initialLocale}
      dir={initialLocale === "ar" ? "rtl" : "ltr"}
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, notoSansHeading.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={initialLocale}>
          <ThemeProvider>
            <TooltipProvider>
              <AuthProvider>
                <OrganizationProvider>
                  <WorkspaceUIProvider>
                    {children}
                    <Toaster richColors position="bottom-right" />
                  </WorkspaceUIProvider>
                </OrganizationProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
