import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
        console.log('📁 Destino do upload:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Nome único para evitar conflitos
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        console.log('📄 Nome do arquivo:', uniqueName);
        cb(null, uniqueName);
    }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        console.log('✅ Arquivo aceito:', file.originalname);
        return cb(null, true);
    } else {
        console.log('❌ Tipo de arquivo rejeitado:', file.mimetype);
        cb(new Error('Apenas imagens são permitidas'));
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});