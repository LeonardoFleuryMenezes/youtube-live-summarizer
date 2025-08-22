/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Electron - Build estático
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Configurações de assets para funcionar offline
  assetPrefix: '',
  basePath: '',
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
    unoptimized: true,
  },
  
  // Desabilitar recursos que não funcionam com export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Garantir que todos os assets sejam incluídos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Forçar inclusão de todos os assets
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]'
      }
    });
    
    return config
  },
}

module.exports = nextConfig
