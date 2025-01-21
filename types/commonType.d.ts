import { Request, Response, NextFunction } from 'express';
import { Schemas } from './schemaTypes';

export namespace CommonTypes {
    export interface DBInfo {
        STATUS: string;
        HOST: string;
        DATE_TIME: string;
    }
    export interface SendEmailOptions {
        receiver: string;
        subject: string;
        htmlContent: string;
    }
    export interface SendEmailResponse {
        success: boolean;
        message: string;
    }

    export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
    export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

    export interface CustomRequest extends Request {
        user?: Schemas.IUser;
    }
}