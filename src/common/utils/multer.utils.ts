import { BadRequestException } from "@nestjs/common"
import { Request, Response } from "express"
import { mkdirSync } from "fs"
import { diskStorage } from "multer"
import { extname, join } from "path"

export type callbackDestination = (err: Error | null, destination: string) => (void)
export type callbackFilename = (err: Error | null, filename: string) => (void)
export type multerFile = Express.Multer.File
export function destinationUtils(fileName: string) {
    return function (req: Request, file: multerFile, callback: callbackDestination) {
        const path = join('public', 'upload', fileName)
        mkdirSync(path, { recursive: true })
        callback(null, path)
    }
}
export function filenameUtils(req: Request, file: multerFile, callback: callbackFilename) {
    const ext = extname(file.originalname).toLocaleLowerCase()
    if (!validateImageFileFormat(ext)) {
        callback(new BadRequestException('file format is invalid'), null)
    } else {
        const filename = `${Date.now()}${ext}`
        callback(null, filename)
    }
}
export function multerStorageDisc(folderName : string){
    return diskStorage({
        destination: destinationUtils(folderName),
        filename: filenameUtils
      })
}
function validateImageFileFormat(ext: string) {
    return [".png", ".jpg", ".pdf"].includes(ext);
}