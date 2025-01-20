import { Request, Response, NextFunction } from 'express';
import { CommonTypes } from '../../types/commonType';

export class AsyncHandler {
    // Constructor accepting the handler function
    constructor(private fn: CommonTypes.AsyncHandler) { }

    // Middleware method to handle async routes
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.fn(req, res, next);
        } catch (err: any) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message,
            });
        }
    };
}