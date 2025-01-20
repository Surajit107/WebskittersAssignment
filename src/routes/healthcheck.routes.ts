import express, { Router } from 'express';
import { HealthCheckController } from "../controllers/healthcheck.controller";

export class HealthCheckRoute {
    private router: Router;
    private healthCheckController: HealthCheckController;

    constructor() {
        this.router = express.Router();
        this.healthCheckController = new HealthCheckController();
        this.initializeRoutes();
    }

    // Method to initialize routes
    private initializeRoutes() {
        this.router.route('/').get(this.healthCheckController.handle);
    }

    // Method to get the router
    public getRouter(): Router {
        return this.router;
    }
}