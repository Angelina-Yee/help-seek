import multer from "multer";

function fileFilter(_req, file, cb) {
  if (/^image\//i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image uploads are allowed"));
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024
  },
});

export const uploadImage = upload;