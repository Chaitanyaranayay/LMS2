import multer from "multer";
import path from "path";

let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        const safeName = file.originalname.replace(/\s+/g, '-');
        const uniqueName = `${Date.now()}-${safeName}`;
        cb(null, uniqueName)
    }
})

const upload = multer({storage})

export default upload