import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorios si no existen
const uploadsDir = path.join(__dirname, '../../uploads');
const grueroPhotosDir = path.join(uploadsDir, 'gruero-photos');
const gruaPhotosDir = path.join(uploadsDir, 'grua-photos');
const documentsDir = path.join(uploadsDir, 'documentos');

[uploadsDir, grueroPhotosDir, gruaPhotosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento para fotos de gruero
const grueroPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, grueroPhotosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gruero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración de almacenamiento para fotos de grúa
const gruaPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, gruaPhotosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'grua-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración de almacenamiento para documentos
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const tipoDoc = req.body.tipoDocumento || 'doc';
    cb(null, tipoDoc + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

// Filtro para documentos (imágenes y PDFs)
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes o PDFs'));
  }
};

// Exportar configuraciones
export const uploadGrueroPhoto = multer({
  storage: grueroPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

export const uploadGruaPhoto = multer({
  storage: gruaPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter
});