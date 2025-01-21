import { ObjectId } from "mongoose";
import { AsyncHandler } from "../../utils/asyncHandler";
import UserModel from "../../models/user.model";
import { Request, Response } from "express";
import TokenService from "../../utils/createTokens";
import { ApiError } from "../../utils/ApiError";
import { ResponseHandler } from "../../utils/response";
import { ApiResponse } from "../../utils/ApiResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CommonTypes } from "../../../types/commonType";
import EmailService from "../../utils/EmailService";

class CookieOptions {
    static httpOnly = true;
    static secure = true;
    // static maxAge = 24 * 60 * 60 * 1000; // 1 Day
    static sameSite: 'lax' | 'strict' | 'none' = 'strict';

    static getOptions() {
        return {
            httpOnly: this.httpOnly,
            secure: this.secure,
            // maxAge: this.maxAge,
            sameSite: this.sameSite,
        };
    }
}

export class AuthService {
    static async fetchUserData(userId: string | ObjectId) {
        return UserModel.aggregate([
            {
                $match: {
                    isVerified: true,
                    _id: userId,
                },
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                },
            },
        ]);
    }

    private static async isEmailRegistered(email: string) {
        return UserModel.findOne({ email });
    }

    // registerUser method
    static registerUser = new AsyncHandler(async (req: Request, res: Response) => {
        const { fullName, email, password } = req.body;

        const existingUser = await this.isEmailRegistered(email);

        if (existingUser) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(409, "User with this email already exists"));
        }

        const newUser = await UserModel.create({
            fullName,
            email,
            password,
            isVerified: false,
            answers: []
        });

        if (!newUser) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(404, "User not found"));
        }

        // Generate email verification token
        const verificationToken = TokenService.generateVerificationToken(newUser._id);
        const verificationUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/verify-email?token=${verificationToken}`;

        // Send verification email using EmailService
        const emailResponse = await EmailService.sendEmail({
            receiver: newUser.email,
            subject: 'Email Verification - Please verify your account',
            htmlContent: `<p>Please verify your account by clicking on the link below:</p>
                      <a href="${verificationUrl}">${verificationUrl}</a>`
        });

        if (!emailResponse.success) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, emailResponse.message));
        }

        return ResponseHandler.sendSuccessResponse(res, 201, {}, "User registered successfully. Please check your email to verify your account.");
    }).handle;

    // registerUser method
    static verifyEmail = new AsyncHandler(async (req: Request, res: Response) => {
        const { token } = req.query;

        if (!token) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Verification token is required"));
        }

        try {
            // Verify the token
            const decodedToken = jwt.verify(token as string, process.env.EMAIL_VERIFICATION_SECRET as string) as JwtPayload;
            const userId = decodedToken._id;

            // Find the user and mark them as verified
            const user = await UserModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true });

            if (!user) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Invalid token or user does not exist"));
            }

            return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
        } catch (error) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Invalid or expired token"));
        }
    }).handle;

    // loginUser method
    static loginUser = new AsyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Email is required"));
        }

        const user = await this.isEmailRegistered(email);

        if (!user) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "User does not exist"));
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(403, "Invalid user credentials"));
        }

        if (!user.isVerified) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(403, "Please verify your account before login."));
        }

        const { accessToken, refreshToken } = await TokenService.generateAccessAndRefreshToken(res, user?._id);
        const loggedInUser = await this.fetchUserData(user?._id);        

        const filteredUser = {
            _id: loggedInUser[0]._id,
            fullName: loggedInUser[0].fullName,
            email: loggedInUser[0].email,
            avatar: loggedInUser[0].avatar,
            isVerified: loggedInUser[0].isVerified,
        };

        return res.status(200)
            .cookie("accessToken", accessToken, CookieOptions.getOptions())
            .cookie("refreshToken", refreshToken, CookieOptions.getOptions())
            .json(new ApiResponse(200, { user: filteredUser, accessToken, refreshToken }, "User logged in successfully"));
    }).handle;

    // logoutUser method
    static logoutUser = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        if (!req.user || !req.user?._id) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "User not found in request"));
        }

        const userId = req.user._id;

        // Clear refreshToken from the user's record
        await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    refreshToken: "",
                },
            },
            { new: true }
        );

        const cookieOptions = CookieOptions.getOptions();

        return res.status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    }).handle;

    // refreshAccessToken method
    static refreshAccessToken = new AsyncHandler(async (req: Request, res: Response) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!incomingRefreshToken) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(401, "Unauthorized request"));
        }

        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
            const user = await UserModel.findById(decodedToken?._id);

            if (!user) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(401, "Invalid refresh token"));
            }

            if (user.refreshToken !== incomingRefreshToken) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(401, "Refresh token is expired or used"));
            }

            const cookieOptions = CookieOptions.getOptions();

            const { accessToken, refreshToken } = await TokenService.generateAccessAndRefreshToken(res, user._id);

            return res.status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));

        } catch (exc: any) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(401, exc.message || "Invalid refresh token"));
        }
    }).handle;
}
