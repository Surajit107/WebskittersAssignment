import { Response } from "express";
import { ObjectId } from "mongoose";
import { ApiError } from "./ApiError";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";

class TokenService {
    static async generateAccessAndRefreshToken(
        res: Response,
        userId: string | ObjectId
    ): Promise<{ accessToken: string | undefined; refreshToken: string | undefined }> {
        try {
            const user = await UserModel.findById(userId);

            if (!user) {
                throw new ApiError(404, "User not found");
            }

            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, "Something went wrong while generating refresh and access token");
        }
    }

    static generateVerificationToken(userId: string | ObjectId) {
        return jwt.sign({ _id: userId }, process.env.EMAIL_VERIFICATION_SECRET as string, { expiresIn: '1d' }); // Token valid for 1 day
    }
}

export default TokenService;