import { Response } from "express";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

export class ResponseHandler {

    // Method to send success response
    public static sendSuccessResponse<T>(
        res: Response,
        statusCode: number,
        data: T,
        message: string = "Success",
    ): Response {
        const response = new ApiResponse(statusCode, data, message);
        return res.status(response.statusCode).json(response);
    }

    // Method to send error response
    public static sendErrorResponse(res: Response, error: ApiError): Response {
        const responsePayload: any = {
            statusCode: error.statusCode,
            success: error.success,
            message: error.message,
            errors: error.errors,
            data: error.data
        };

        if (error.data) {
            responsePayload.data = error.data;
        }

        return res.status(error.statusCode).json(responsePayload);
    }
}