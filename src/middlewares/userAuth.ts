import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UserModel from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { ResponseHandler } from '../utils/response';
import { AsyncHandler } from '../utils/asyncHandler';
import { CommonTypes } from '../../types/commonType';

export default class AuthMiddleware {
    // Wrap the verifyJWTToken method with AsyncHandler
    public static verifyJWTToken = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response, next: NextFunction) => {
        try {
            let token = req.cookies.accessToken || req.body.accessToken || req.header("Authorization")?.replace("Bearer ", "");

            if (!token) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(401, "Unauthorized Request"));
            };

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
            const user = await UserModel.findById(decodedToken?._id).select("-password -refreshToken");

            if (!user) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(401, "Invalid access token"));
            };
            req.user = user;

            next();
        } catch (error: any) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(401, error.message || "Invalid access token. Token is required."));
        }
    }).handle;
}