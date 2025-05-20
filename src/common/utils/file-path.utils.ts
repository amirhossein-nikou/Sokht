import { join } from "path";
import { multerFile } from "./multer.utils";
export function getImagePath(file: multerFile, imagePath: string) {
    if (file) {
        return join(imagePath).replace(/\\/gi, '/')
    } else {
        return ''
    }
}