import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Criar Lojas',
  description: 'Plataforma de criação de lojas virtuais com setup assistido.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
