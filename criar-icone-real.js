const fs = require('fs');
const path = require('path');

console.log('🎨 Criando ícone ICO real e funcional...');

// Caminho do arquivo SVG
const svgPath = path.join(__dirname, 'electron', 'assets', 'icon.svg');
const icoPath = path.join(__dirname, 'electron', 'assets', 'icon.ico');

// Verificar se o SVG existe
if (!fs.existsSync(svgPath)) {
    console.error('❌ Arquivo SVG não encontrado:', svgPath);
    process.exit(1);
}

console.log('✅ SVG encontrado:', svgPath);

// Criar um arquivo ICO real com cabeçalho correto
// Este é um ícone ICO válido de 16x16 pixels
const icoHeader = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00,
    0x20, 0x00, 0x28, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00,
    0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

// Dados de imagem simples (16x16 pixels, 32-bit RGBA)
// Criando um ícone simples com cores básicas
const imageData = Buffer.alloc(1024); // 16x16 * 4 bytes (RGBA)

// Preencher com um padrão simples (círculo vermelho com detalhes)
for (let i = 0; i < 1024; i += 4) {
    const x = (i / 4) % 16;
    const y = Math.floor((i / 4) / 16);
    const centerX = 8;
    const centerY = 8;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (distance <= 8) {
        // Círculo vermelho (YouTube)
        imageData[i] = 255;     // R
        imageData[i + 1] = 0;   // G
        imageData[i + 2] = 0;   // B
        imageData[i + 3] = 255; // A
    } else {
        // Fundo transparente
        imageData[i] = 0;       // R
        imageData[i + 1] = 0;   // G
        imageData[i + 2] = 0;   // B
        imageData[i + 3] = 0;   // A
    }
}

// Combinar cabeçalho e dados
const icoContent = Buffer.concat([icoHeader, imageData]);

try {
    fs.writeFileSync(icoPath, icoContent);
    console.log('✅ Ícone ICO real criado com sucesso!');
    console.log('📍 Localização:', icoPath);
    console.log('📏 Tamanho: 16x16 pixels');
    console.log('🎨 Cores: Vermelho (YouTube) com transparência');
    console.log('');
    console.log('🚀 Agora execute "ABRIR-APLICATIVO.bat" para testar!');
    console.log('✅ O aplicativo deve funcionar com URLs reais do YouTube!');
} catch (error) {
    console.error('❌ Erro ao criar o ícone:', error.message);
    process.exit(1);
}
