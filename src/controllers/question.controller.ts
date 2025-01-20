import { ResponseHandler } from "../utils/response";
import { AsyncHandler } from "../utils/asyncHandler";
import csv from "csv-parser";
import * as fs from "fs";
import CategoryModel from "../models/category.model";
import QuestionModel from "../models/question.model";
import { ApiError } from "../utils/ApiError";
import { CommonTypes } from "../../types/commonType";
import { Response } from "express";
import UserModel from "../models/user.model";


export class QuestionService {

    // Bulk Question Import with Category Handling (with Options & Correct Answer)
    static bulkImportQuestions = new AsyncHandler(async (req, res) => {
        const csvFile = req.file;

        if (!csvFile?.path) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, "CSV file is missing"));
        }

        const questions: Array<any> = [];
        const categoriesSet: Set<string> = new Set();

        // Step 1: Extract unique categories
        fs.createReadStream(csvFile.path)
            .pipe(csv())
            .on("data", (row: { questionText: any; categoryName: any; options: any; correctAnswer: any; }) => {
                const { categoryName } = row;
                if (categoryName) {
                    const categoryNames = categoryName.split(',').map((name: string) => name.trim());
                    categoryNames.forEach((name: string) => categoriesSet.add(name));
                }
            })
            .on("end", async () => {
                try {
                    // Step 2: Insert categories into the database
                    const categoryIdsMap: { [key: string]: string } = {};

                    for (const categoryName of categoriesSet) {
                        let category = await CategoryModel.findOne({ categoryName });

                        if (!category) {
                            category = new CategoryModel({ categoryName });
                            await category.save();
                        }

                        categoryIdsMap[categoryName] = category._id.toString();
                    }

                    // Step 3: Process the CSV again to insert the questions
                    fs.createReadStream(csvFile.path)
                        .pipe(csv())
                        .on("data", (row: { questionText: any; categoryName: any; options: any; correctAnswer: any; }) => {
                            const { questionText, categoryName, options, correctAnswer } = row;

                            const categoryNames = categoryName.split(',').map((name: string) => name.trim());
                            const categoryIds = categoryNames.map((name: string | number) => categoryIdsMap[name]); // Map category names to IDs

                            // Ensure that options and correctAnswer are provided
                            if (options && correctAnswer) {
                                const questionData = {
                                    questionText,
                                    options: options.split(','),  // Assuming options are comma-separated
                                    correctAnswer,
                                    categories: categoryIds,  // Multiple categories assigned here
                                };

                                questions.push(questionData);
                            }
                        })
                        .on("end", async () => {
                            if (questions.length > 0) {
                                await QuestionModel.insertMany(questions);
                                return ResponseHandler.sendSuccessResponse(res, 200, { questions }, "Bulk questions imported successfully");
                            } else {
                                return ResponseHandler.sendErrorResponse(res, new ApiError(400, "No questions found in the CSV file"));
                            }
                        })
                        .on("error", (err) => {
                            return ResponseHandler.sendErrorResponse(res, new ApiError(500, "Error reading CSV file"));
                        });

                } catch (err) {
                    return ResponseHandler.sendErrorResponse(res, new ApiError(500, "Error while saving questions or categories"));
                }
            })
            .on("error", (err) => {
                return ResponseHandler.sendErrorResponse(res, new ApiError(500, "Error reading CSV file"));
            });
    }).handle;

    // Fetch questions grouped by category category
    static getQuestionsForCategories = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        const { categoryName } = req.query;

        try {
            const matchCondition = categoryName && typeof categoryName === 'string'
                ? { categoryName: { $regex: new RegExp(categoryName, 'i') } }
                : {};

            const categoriesWithQuestions = await CategoryModel.aggregate([
                {
                    $match: matchCondition
                },
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
                        questions: {
                            _id: 1,
                            questionText: 1,
                            options: 1,
                            correctAnswer: 1
                        }
                    }
                }
            ]);

            if (!categoriesWithQuestions || categoriesWithQuestions.length === 0) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, 'No categories found or no questions for the specified category'));
            }

            return ResponseHandler.sendSuccessResponse(res, 200, { categories: categoriesWithQuestions }, 'Questions fetched successfully');
        } catch (err) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, 'Error while fetching questions for categories'));
        }
    }).handle;

    // User submits answer to a question module
    // User submits answer to a question module
    static submitAnswer = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        const { questionId, selectedAnswer } = req.body;

        if (!questionId || !selectedAnswer) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, 'Question ID and selected answer are required'));
        }

        try {
            const question = await QuestionModel.findById(questionId);

            if (!question) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, 'Question not found'));
            }

            const answerSubmission = {
                question: questionId,
                selectedAnswer,
                submittedAt: Math.floor(Date.now() / 1000) // Store Unix timestamp (seconds)
            };

            const user = await UserModel.findByIdAndUpdate(
                req.user?._id,
                { $push: { answers: answerSubmission } },
                { new: true }
            );

            if (!user) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, 'User not found'));
            }

            return ResponseHandler.sendSuccessResponse(res, 200, { answer: answerSubmission }, 'Answer submitted successfully');
        } catch (err) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, 'Error while submitting answer'));
        }
    }).handle;

    // Search questions based on user answers with timezone module
    static searchQuestionWithAnswer = new AsyncHandler(async (req: CommonTypes.CustomRequest, res: Response) => {
        const { searchQuery, timezone } = req.query;

        if (!searchQuery) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(400, 'Search query is required'));
        }

        try {
            const userAnswers = await UserModel.aggregate([
                {
                    $unwind: "$answers"
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "answers.question",
                        foreignField: "_id",
                        as: "questionDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$questionDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        $or: [
                            { "questionDetails.questionText": { $regex: searchQuery, $options: 'i' } },
                            { "answers.selectedAnswer": { $regex: searchQuery, $options: 'i' } }
                        ]
                    }
                },
                {
                    $project: {
                        questionText: "$questionDetails.questionText",
                        options: "$questionDetails.options",
                        correctAnswer: "$questionDetails.correctAnswer",
                        selectedAnswer: "$answers.selectedAnswer",
                        submissionTime: {
                            $dateToString: {
                                format: "%Y-%m-%d %H:%M:%S",
                                date: { $toDate: { $multiply: ["$answers.submittedAt", 1000] } }, // Convert Unix timestamp to Date
                                timezone: timezone || 'UTC'
                            }
                        }
                    }
                }
            ]);

            if (userAnswers.length === 0) {
                return ResponseHandler.sendErrorResponse(res, new ApiError(404, 'No answers found for the search query'));
            }

            return ResponseHandler.sendSuccessResponse(res, 200, { answers: userAnswers }, 'Answers and corresponding questions fetched successfully');
        } catch (err) {
            return ResponseHandler.sendErrorResponse(res, new ApiError(500, 'Error while searching answers with questions'));
        }
    }).handle;

}