import { AsyncHandler } from "../utils/asyncHandler";
import UserModel from "../models/user.model";
import { Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ResponseHandler } from "../utils/response";
import { CommonTypes } from "../../types/commonType";
import { fileService } from "../utils/fileService";


export class UserService {

    // getCurrentUser module
    static getCurrentUser = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        if (!req.user || !req.user?._id) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "User not found in request"));
        }
        const userData = req.user

        return ResponseHandler.sendSuccessResponse(res, 200, { user: userData }, "Current user fetched successfully");
    }).handle;

    // updateProfile module
    static updateProfile = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        const { fullName, email } = req.body;

        if (!fullName || !email) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "All fields are required"));
        }

        // Update user details
        const userData = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            { new: true }
        ).select("-password -refreshToken");

        if (!userData) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(404, "User not found"));
        }

        return ResponseHandler.sendSuccessResponse(res, 200, { user: userData }, "Account details updated successfully");
    }).handle;

    // updateAvatar module
    static updateAvatar = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        const avatarFile = req.file;

        if (!avatarFile?.path) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Avatar file is missing"));
        }

        const newAvatarFilePath = fileService.saveFileLocally(avatarFile);
        if (!newAvatarFilePath) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "Error while uploading avatar"));
        }

        // Update the user's avatar in the database
        const user = await UserModel.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: newAvatarFilePath,
                }
            },
            { new: true } // To return the updated user
        ).select("-password"); // Exclude password from the response

        return ResponseHandler.sendSuccessResponse(res, 200, user, "Avatar image updated successfully");
    }).handle;
}