import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './inline-styles.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Live Summarizer - Resumo de Lives com IA',
  description: 'Aplicativo para fazer resumo automático de lives no YouTube usando inteligência artificial',
  keywords: ['youtube', 'live', 'summarizer', 'ai', 'transcript', 'resumo'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Estilos inline para garantir funcionamento no Electron */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
              color: #1f2937;
              min-height: 100vh;
            }
            
            .min-h-screen {
              min-height: 100vh;
            }
            
            .bg-gradient-to-br {
              background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
            }
            
            .from-blue-50 {
              background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
            }
            
            .to-indigo-100 {
              background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
            }
            
            /* Layout */
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 1rem;
            }
            
            /* Cabeçalho */
            header {
              background: white;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              border-bottom: 1px solid #e5e7eb;
            }
            
            .max-w-7xl {
              max-width: 80rem;
            }
            
            .mx-auto {
              margin-left: auto;
              margin-right: auto;
            }
            
            .px-4 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .sm\\:px-6 {
              padding-left: 1.5rem;
              padding-right: 1.5rem;
            }
            
            .lg\\:px-8 {
              padding-left: 2rem;
              padding-right: 2rem;
            }
            
            .py-6 {
              padding-top: 1.5rem;
              padding-bottom: 1.5rem;
            }
            
            .py-8 {
              padding-top: 2rem;
              padding-bottom: 2rem;
            }
            
            /* Flexbox */
            .flex {
              display: flex;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .space-x-3 > * + * {
              margin-left: 0.75rem;
            }
            
            .space-x-2 > * + * {
              margin-left: 0.5rem;
            }
            
            /* Grid */
            .grid {
              display: grid;
            }
            
            .grid-cols-1 {
              grid-template-columns: repeat(1, minmax(0, 1fr));
            }
            
            .lg\\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            
            .md\\:grid-cols-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
            
            .gap-4 {
              gap: 1rem;
            }
            
            .gap-6 {
              gap: 1.5rem;
            }
            
            .gap-8 {
              gap: 2rem;
            }
            
            /* Espaçamento */
            .mb-4 {
              margin-bottom: 1rem;
            }
            
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            
            .mb-8 {
              margin-bottom: 2rem;
            }
            
            .mr-2 {
              margin-right: 0.5rem;
            }
            
            /* Tipografia */
            h1 {
              font-size: 1.875rem;
              line-height: 2.25rem;
              font-weight: 700;
              color: #111827;
            }
            
            h2 {
              font-size: 1.5rem;
              line-height: 2rem;
              font-weight: 600;
              color: #111827;
            }
            
            h3 {
              font-size: 1.125rem;
              line-height: 1.75rem;
              font-weight: 600;
              color: #111827;
            }
            
            p {
              color: #6b7280;
            }
            
            /* Cores */
            .bg-white {
              background-color: #ffffff;
            }
            
            .bg-youtube-red {
              background-color: #ff0000;
            }
            
            .bg-gray-200 {
              background-color: #e5e7eb;
            }
            
            .bg-blue-50 {
              background-color: #eff6ff;
            }
            
            .bg-green-50 {
              background-color: #f0fdf4;
            }
            
            .bg-purple-50 {
              background-color: #faf5ff;
            }
            
            .bg-orange-50 {
              background-color: #fff7ed;
            }
            
            .bg-gray-50 {
              background-color: #f9fafb;
            }
            
            .bg-blue-100 {
              background-color: #dbeafe;
            }
            
            .bg-blue-500 {
              background-color: #3b82f6;
            }
            
            .bg-green-500 {
              background-color: #22c55e;
            }
            
            .bg-purple-500 {
              background-color: #a855f7;
            }
            
            .bg-orange-500 {
              background-color: #f97316;
            }
            
            .bg-yellow-600 {
              background-color: #ca8a04;
            }
            
            /* Texto */
            .text-white {
              color: #ffffff;
            }
            
            .text-gray-900 {
              color: #111827;
            }
            
            .text-gray-800 {
              color: #1f2937;
            }
            
            .text-gray-700 {
              color: #374151;
            }
            
            .text-gray-600 {
              color: #4b7280;
            }
            
            .text-gray-500 {
              color: #6b7280;
            }
            
            .text-blue-600 {
              color: #2563eb;
            }
            
            .text-blue-800 {
              color: #1e40af;
            }
            
            .text-green-600 {
              color: #16a34a;
            }
            
            .text-green-800 {
              color: #166534;
            }
            
            .text-purple-600 {
              color: #9333ea;
            }
            
            .text-purple-800 {
              color: #6b21a8;
            }
            
            .text-orange-600 {
              color: #ea580c;
            }
            
            .text-orange-800 {
              color: #c2410c;
            }
            
            .text-yellow-600 {
              color: #ca8a04;
            }
            
            /* Tamanhos */
            .h-8 {
              height: 2rem;
            }
            
            .w-8 {
              width: 2rem;
            }
            
            .h-6 {
              height: 1.5rem;
            }
            
            .w-6 {
              width: 1.5rem;
            }
            
            .h-5 {
              height: 1.25rem;
            }
            
            .w-5 {
              width: 1.25rem;
            }
            
            .h-2 {
              height: 0.5rem;
            }
            
            .w-full {
              width: 100%;
            }
            
            /* Bordas */
            .border {
              border-width: 1px;
            }
            
            .border-b {
              border-bottom-width: 1px;
            }
            
            .border-t {
              border-top-width: 1px;
            }
            
            .border-gray-200 {
              border-color: #e5e7eb;
            }
            
            .border-gray-300 {
              border-color: #d1d5db;
            }
            
            .rounded-lg {
              border-radius: 0.5rem;
            }
            
            .rounded-md {
              border-radius: 0.375rem;
            }
            
            .rounded-full {
              border-radius: 9999px;
            }
            
            .rounded-sm {
              border-radius: 0.125rem;
            }
            
            /* Sombras */
            .shadow-sm {
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            
            .shadow-md {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            
            /* Padding */
            .p-2 {
              padding: 0.5rem;
            }
            
            .p-3 {
              padding: 0.75rem;
            }
            
            .p-4 {
              padding: 1rem;
            }
            
            .p-6 {
              padding: 1.5rem;
            }
            
            .px-3 {
              padding-left: 0.75rem;
              padding-right: 0.75rem;
            }
            
            .px-4 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .py-1 {
              padding-top: 0.25rem;
              padding-bottom: 0.25rem;
            }
            
            .py-2 {
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
            }
            
            .py-8 {
              padding-top: 2rem;
              padding-bottom: 2rem;
            }
            
            /* Margens */
            .mt-4 {
              margin-top: 1rem;
            }
            
            .mt-8 {
              margin-top: 2rem;
            }
            
            .mb-4 {
              margin-bottom: 1rem;
            }
            
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            
            .mb-8 {
              margin-bottom: 2rem;
            }
            
            .pt-4 {
              padding-top: 1rem;
            }
            
            .pt-6 {
              padding-top: 1.5rem;
            }
            
            /* Componentes específicos */
            .card {
              background: white;
              border-radius: 0.75rem;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              border: 1px solid #e5e7eb;
              padding: 1.5rem;
            }
            
            .btn-primary {
              background-color: #2563eb;
              color: white;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
              display: inline-flex;
              align-items: center;
            }
            
            .btn-primary:hover {
              background-color: #1d4ed8;
            }
            
            .btn-secondary {
              background-color: #e5e7eb;
              color: #374151;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 0.5rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .btn-secondary:hover {
              background-color: #d1d5db;
            }
            
            .input-field {
              width: 100%;
              padding: 0.75rem;
              border: 1px solid #d1d5db;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              transition: border-color 0.2s;
            }
            
            .input-field:focus {
              outline: none;
              border-color: #2563eb;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            
            /* Hover effects */
            .hover\\:bg-gray-100:hover {
              background-color: #f3f4f6;
            }
            
            .hover\\:text-gray-900:hover {
              color: #111827;
            }
            
            .hover\\:text-red-600:hover {
              color: #dc2626;
            }
            
            /* Transições */
            .transition-colors {
              transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
            }
            
            .transition-all {
              transition-property: all;
            }
            
            .duration-500 {
              transition-duration: 500ms;
            }
            
            /* Cursor */
            .cursor-pointer {
              cursor: pointer;
            }
            
            /* Overflow */
            .overflow-y-auto {
              overflow-y: auto;
            }
            
            /* Max height */
            .max-h-96 {
              max-height: 24rem;
            }
            
            /* Responsividade */
            @media (max-width: 768px) {
              .grid-cols-1.md\\:grid-cols-3 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
              
              .grid-cols-1.md\\:grid-cols-4 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
              
              .grid-cols-1.md\\:grid-cols-2 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
            }
            
            @media (max-width: 1024px) {
              .lg\\:grid-cols-2 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}



