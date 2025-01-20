import { Request, Response, NextFunction } from 'express';
import { Schemas } from './schemaTypes';

export namespace CommonTypes {
    export interface DBInfo {
        STATUS: string;
        HOST: string;
        DATE_TIME: string;
    }

    export type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
    export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

    export interface CustomRequest extends Request {
        user?: Schemas.IUser;
    }
}