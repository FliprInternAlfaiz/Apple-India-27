import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories
const videoDir = "uploads/videos";
const proofDir = "uploads/paymentProofs";

if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

// ---------- Storage for videos ----------
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// ---------- Storage for payment proofs (any file) ----------
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proofDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// ---------- Video Filter ----------
const videoFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-flv",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."));
  }
};

// ---------- Proof Filter (allow any file) ----------
const proofFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow any type (image, pdf, docx, etc.)
  cb(null, true);
};

// ---------- Upload Middleware Instances ----------
export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const paymentProofUpload = multer({
  storage: proofStorage,
  fileFilter: proofFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for proof
});

export const uploadSingleVideo = videoUpload.single("video");
export const uploadPaymentProof = paymentProofUpload.single("paymentProof");

// ---------- Error Handler ----------
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too large. Maximum size limit reached.",
      });
    }
    return res.status(400).json({ status: "error", message: err.message });
  } else if (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
  next();
};
