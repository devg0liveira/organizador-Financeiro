import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FinanceProvider } from '@/hooks/use-finance'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'NexBank | Gestão e Análise Financeira Consolidada',
  description:
    'Plataforma profissional para controle de receitas, despesas, fluxo de caixa e planejamento orçamentário com visualizações de dados precisas e confiáveis.',
  keywords: [
    'gestão financeira',
    'controle de gastos',
    'fluxo de caixa',
    'organizador financeiro',
    'balanço orçamentário',
    'NexBank',
  ],
  authors: [{ name: 'NexBank Financial Systems' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'NexBank | Gestão e Análise Financeira Consolidada',
    description:
      'Acompanhe seu fluxo de caixa, despesas por categoria e saldos patrimoniais com máxima clareza.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["light", "dark", "purple", "purple-theme"]}
          value={{
            light: "light",
            dark: "dark",
            purple: "purple",
            "purple-theme": "purple",
          }}
          disableTransitionOnChange
        >
          <FinanceProvider>
            {children}
            <Toaster />
          </FinanceProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}

