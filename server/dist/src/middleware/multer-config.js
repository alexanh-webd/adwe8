// src/middleware/multer-config.ts
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const storage = multer.diskStorage({
    //File in and where to save it?
    destination: (req, file, cb) => {
        cb(null, "./public/textfiles");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // .jpg, .png
        const baseName = path.basename(file.originalname, ext); // filename without extension
        const uniqueId = uuidv4();
        // final filename: original_without_ext_UUID.ext
        const finalName = `${baseName}_${uniqueId}${ext}`;
        cb(null, finalName);
    }
});
const upload = multer({ storage });
export default upload;
//# sourceMappingURL=multer-config.js.map