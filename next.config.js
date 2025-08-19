/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  // Removido output: 'export' para permitir servidor de desenvolvimento
  // Removido trailingSlash: true para evitar problemas de roteamento
  // Removido distDir: 'out' para usar .next padrão
  
  // Configurações que funcionam em ambos os modos
  assetPrefix: '',
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
    unoptimized: true,
  },
  
  // Configurações de desenvolvimento
  // Removido experimental: { appDir: true }
}

module.exports = nextConfig
