import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { Request } from 'express';

class FileUpload {
    private storage: StorageEngine;
    private fileFilter: multer.Options['fileFilter'];

    constructor() {
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/temp');
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix);
            }
        });

        this.fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
            const allowedTypes = /csv|pdf|jpeg|jpg|png/;
            const isValidFileType = allowedTypes.test(file.mimetype);
            if (isValidFileType) {
                cb(null, true);
            } else {
                cb(null, false);
            }
        };
    }

    public getUploadMiddleware() {
        return multer({ storage: this.storage, fileFilter: this.fileFilter });
    }
}


const fileUploadInstance = new FileUpload();
export const upload = fileUploadInstance.getUploadMiddleware();