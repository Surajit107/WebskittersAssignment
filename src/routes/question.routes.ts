import express, { Router } from "express";
import { QuestionService } from "../controllers/question.controller";
import AuthMiddleware from "../middlewares/userAuth";
import { upload } from "../middlewares/multer.middleware";

export default class UserRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use([AuthMiddleware.verifyJWTToken]); // Apply VerifyJWTToken middleware to all routes in this file

        // Secured routes
        this.router.route('/').post(upload.single('csv'), QuestionService.bulkImportQuestions);
        this.router.route('/category').get(QuestionService.getQuestionsForCategories);
        this.router.route('/submitAnswer').post(QuestionService.submitAnswer);
        this.router.route('/searchWithAnswer').get(QuestionService.searchQuestionWithAnswer);
    }

    public getRouter(): Router {
        return this.router;
    }
}