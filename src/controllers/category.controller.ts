import { AsyncHandler } from "../utils/asyncHandler";
import { ResponseHandler } from "../utils/response";
import { ApiError } from "../utils/ApiError";
import CategoryModel from "../models/category.model";
import { Response } from "express";
import { CommonTypes } from "../../types/commonType";

export class CategoryService {

    // Fetch all categories module
    static getAllCategories = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        try {
            const categories = await CategoryModel.find();

            if (!categories || categories.length === 0) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, "No categories found"));
            }

            return ResponseHandler.sendSuccessResponse(res, 200, { categories }, "Categories fetched successfully");
        } catch (err) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, "Error while fetching categories"));
        }
    }).handle;

    // List all categories along with total question count module
    static getCategoriesWithQuestionCount = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        try {
            const categoriesWithQuestionCount = await CategoryModel.aggregate([
                {
                    $lookup: {
                        from: 'questions',
                        localField: '_id',
                        foreignField: 'categories',
                        as: 'questions'
                    }
                },
                {
                    $project: {
                        categoryName: 1,
                        totalQuestions: { $size: '$questions' }
                    }
                }
            ]);

            if (!categoriesWithQuestionCount || categoriesWithQuestionCount.length === 0) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, 'No categories found'));
            }

            return ResponseHandler.sendSuccessResponse(res, 200, { categories: categoriesWithQuestionCount }, 'Categories fetched successfully with question count');
        } catch (err) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, 'Error while fetching categories with question count'));
        }
    }).handle;

}