import multer from "multer";
import path from "path";
import fs from "fs";

/* ============================================================
   ✅ Create upload directories if not exist
============================================================ */
const videoDir = "uploads/videos";
const proofDir = "uploads/paymentProofs";
const aadhaarDir = "uploads/aadhaar";
const newsDir = "uploads/conference-news";
const luckyDrawDir = "uploads/lucky-draw";

[videoDir, proofDir, aadhaarDir, newsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ============================================================
   ✅ Storage configurations
============================================================ */

// ---------- Video Storage ----------
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// ---------- Payment Proof Storage ----------
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proofDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// ---------- Aadhaar Storage ----------
const aadhaarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, aadhaarDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `aadhaar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ---------- Conference News Storage ----------
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, newsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `news-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const luckyDrawStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, luckyDrawDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `lucky-draw-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});


/* ============================================================
   ✅ File Filters
============================================================ */

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
) => cb(null, true);

// ---------- Aadhaar Filter ----------
const aadhaarFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only JPEG, JPG, PNG, or PDF files are allowed for Aadhaar!"));
};

// ---------- Conference News Filter ----------
const newsFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only image files are allowed for news upload!"));
};

const luckyDrawFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only image files are allowed for lucky draw upload!"));
};

/* ============================================================
   ✅ Upload Middleware Instances
============================================================ */
export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const paymentProofUpload = multer({
  storage: proofStorage,
  fileFilter: proofFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const aadhaarUpload = multer({
  storage: aadhaarStorage,
  fileFilter: aadhaarFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const newsUpload = multer({
  storage: newsStorage,
  fileFilter: newsFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const luckyDrawUpload = multer({
  storage: luckyDrawStorage,
  fileFilter: luckyDrawFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ============================================================
   ✅ Single Upload Helpers
============================================================ */
export const uploadSingleVideo = videoUpload.single("video");
export const uploadPaymentProof = paymentProofUpload.single("paymentProof");
export const uploadAadhaarFile = aadhaarUpload.single("aadhaarPhoto");
export const uploadConferenceNews = newsUpload.single("newsImage");
export const uploadLuckyDrawImage = luckyDrawUpload.single("luckyDrawImage");

/* ============================================================
   ✅ Error Handler Middleware
============================================================ */
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
