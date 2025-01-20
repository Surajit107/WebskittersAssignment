import fs from 'fs';
import path from 'path';

class FileService {
    private uploadDirectory: string;

    constructor() {
        // Set upload directory relative to the project root
        this.uploadDirectory = path.join(process.cwd(), 'public', 'temp');

        // Ensure the directory exists
        if (!fs.existsSync(this.uploadDirectory)) {
            fs.mkdirSync(this.uploadDirectory, { recursive: true });
        }
    }

    public saveFileLocally(file: Express.Multer.File): string {
        const fileExtension = path.extname(file.originalname);
        const localFilePath = path.join(this.uploadDirectory, `${file.filename}${fileExtension}`);

        fs.renameSync(file.path, localFilePath);
        const newAvatarFilePath = file ? `${process.env.HOST}/temp/` + `${file.filename}${fileExtension}` : "";

        return newAvatarFilePath;
    }

    public deleteFile(filePath: string): void {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

export const fileService = new FileService();