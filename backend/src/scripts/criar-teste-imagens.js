import fs from "fs"
import path from "path";
import { fileURLToPath } from 'url'

// Cria imagens de teste
const testImages = {
    defaults: [
        { name: 'comunicado-estudante.png', content: 'Estudante' },
        { name: 'comunicado-pesquisador.png', content: 'Pesquisador' },
        { name: 'comunicado-linha.png', content: 'Linha de Pesquisa' }
    ]
};
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cria as pastas se não existirem
const baseDir = path.join(__dirname, 'public');
const defaultsDir = path.join(baseDir, 'img', 'defaults');
const uploadsDir = path.join(baseDir, 'uploads');

[baseDir, defaultsDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Criada pasta: ${dir}`);
    }
});

// Cria imagens defaults de teste
testImages.defaults.forEach(img => {
    const filePath = path.join(defaultsDir, img.name);
    if (!fs.existsSync(filePath)) {
        // Cria um arquivo SVG simples como placeholder
        const svgContent = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#3B82F6"/>
  <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
    ${img.content}
  </text>
  <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
    Imagem Default
  </text>
</svg>
        `.trim();
        
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ Criada imagem default: ${filePath}`);
    }
});

// Cria uma imagem de upload de teste
const testUploadPath = path.join(uploadsDir, 'test-image.png');
if (!fs.existsSync(testUploadPath)) {
    const svgContent = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#10B981"/>
  <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
    Imagem de Upload
  </text>
  <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
    Teste de Upload
  </text>
</svg>
    `.trim();
    
    fs.writeFileSync(testUploadPath, svgContent);
    console.log(`✅ Criada imagem de upload: ${testUploadPath}`);
}

console.log('\n🎯 URLs para testar:');
console.log('Default Estudante: http://localhost:3000/img/defaults/comunicado-estudante.png');
console.log('Default Pesquisador: http://localhost:3000/img/defaults/comunicado-pesquisador.png');
console.log('Default Linha: http://localhost:3000/img/defaults/comunicado-linha.png');
console.log('Upload Teste: http://localhost:3000/uploads/test-image.png');
console.log('\n📁 Estrutura de pastas criada com sucesso!');