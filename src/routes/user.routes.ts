import express, { Router } from "express";
import { UserService } from "../controllers/user.controller";
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
        this.router.route('/').get(UserService.getCurrentUser);
        this.router.route('/update-profile').patch(UserService.updateProfile);
        this.router.route('/update-avatar').patch([upload.single("avatar")], UserService.updateAvatar);
    }

    public getRouter(): Router {
        return this.router;
    }
}