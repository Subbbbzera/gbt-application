const multer = require("multer");
const path = require("path");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const IMAGE_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

const DOC_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const DOC_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const createStorage = (prefix = "") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}${uniqueSuffix}${ext}`);
    },
  });

const createFileFilter = (allowedExtensions, allowedMimetypes, errorMsg) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(errorMsg);
    error.status = 400;
    cb(error, false);
  }
};

const uploadImages = multer({
  storage: createStorage(""),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(
    IMAGE_EXTENSIONS,
    IMAGE_MIMETYPES,
    "Дозволені лише зображення форматів: .jpg, .jpeg, .png, .webp"
  ),
});

const uploadDocument = multer({
  storage: createStorage("doc-"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(
    DOC_EXTENSIONS,
    DOC_MIMETYPES,
    "Дозволені лише файли форматів: .jpg, .jpeg, .png, .webp, .pdf"
  ),
});

module.exports = {
  uploadImages,
  uploadDocument,
};
