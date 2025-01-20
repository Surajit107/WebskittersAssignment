import express, { Router } from "express";
import { CategoryService } from "../controllers/category.controller";
import AuthMiddleware from "../middlewares/userAuth";

export default class CategoryRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use([AuthMiddleware.verifyJWTToken]); // Apply VerifyJWTToken middleware to all routes in this file

        // Secured routes for category-related functionalities
        this.router.route('/').get(CategoryService.getAllCategories);
        this.router.route('/withQuestionCount').get(CategoryService.getCategoriesWithQuestionCount);
    }

    public getRouter(): Router {
        return this.router;
    }
}