import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Config } from "./constants";
import { HealthCheckRoute } from './routes/healthcheck.routes';
import AuthRoutes from './routes/auth.routes';
import UserRoutes from './routes/user.routes';
import QuestionRoutes from './routes/question.routes';
import CategoryRoutes from './routes/category.routes';

class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware() {
        this.app.use(
            cors({
                origin: process.env.CORS_ORIGIN,
                credentials: true,
            })
        );
        this.app.use(morgan('dev'));
        this.app.use(express.json({ limit: Config.EXPRESS_CONFIG_LIMIT }));
        this.app.use(express.urlencoded({ extended: true, limit: Config.EXPRESS_CONFIG_LIMIT }));
        this.app.use(express.static("public"));
        this.app.use(cookieParser());
    }

    private initializeRoutes() {
        // Create an instance of the route class
        const healthCheckRoute = new HealthCheckRoute();
        const authRouter = new AuthRoutes();
        const userRouter = new UserRoutes();
        const questionRouter = new QuestionRoutes();
        const categoryRouter = new CategoryRoutes();

        this.app.use("/api/v1/healthcheck", healthCheckRoute.getRouter());
        this.app.use("/api/v1/auth", authRouter.getRouter());
        this.app.use("/api/v1/user", userRouter.getRouter());
        this.app.use("/api/v1/question", questionRouter.getRouter());
        this.app.use("/api/v1/category", categoryRouter.getRouter());

        // Ping Route for testing
        this.app.get('/ping', (req: Request, res: Response) => {
            res.send("Hi!...I am server, Happy to see you boss...");
        });
    }

    private initializeErrorHandling() {
        // Internal server error handling middleware
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.log(err);
            res.status(500).json({
                status: 500,
                message: "Server Error",
                error: err.message,
            });
        });

        // Page not found middleware
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).json({
                status: 404,
                message: "Endpoint Not Found",
            });
        });
    }
}

export default new App().app;