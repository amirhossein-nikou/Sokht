import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorageDisc } from "../utils/multer.utils";

export function UploadImage(fileName: string, folderName: string = 'uploadedFiles') {
    return class UploadUtility extends FileInterceptor(fileName, {
        storage: multerStorageDisc(folderName)
    }){}
}