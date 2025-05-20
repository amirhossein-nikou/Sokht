import { ParseFilePipe, UploadedFile } from "@nestjs/common";

export function uploadedFilesOptional() {
    return UploadedFile(new ParseFilePipe({
        fileIsRequired: false
    }))
}