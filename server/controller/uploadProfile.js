// deps
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// fixed upload directory: ../public/document
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'document');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

// sanitize and constrain uploads
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = (file.originalname || 'profile').replace(/\s+/g, '-').replace(/[^a-z0-9-_.]/gi, '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || 'file'}-${unique}${ext}`);
  },
});

export const uploadProfile = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => cb(allowed.has(file.mimetype) ? null : new Error('Only image files are allowed'), allowed.has(file.mimetype)),
}).single('profile');

// In your router file
// router.post('/alumni/register', uploadProfile, alumniRegistrationController);
