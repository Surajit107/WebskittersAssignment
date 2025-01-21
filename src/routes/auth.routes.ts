import express, { Router } from "express";
import { AuthService } from "../controllers/auth/auth.controller";
import AuthMiddleware from "../middlewares/userAuth";

export default class AuthRoutes {
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public routes
        this.router.route('/signup').post(AuthService.registerUser);
        this.router.route('/verify-email').get(AuthService.verifyEmail);
        this.router.route('/signin').post(AuthService.loginUser);
        this.router.route('/refresh-token').post(AuthService.refreshAccessToken);

        // Secured routes
        this.router.use([AuthMiddleware.verifyJWTToken]);
        this.router.route('/logout').post(AuthService.logoutUser);
    }

    public getRouter(): Router {
        return this.router;
    }
}