import dotenv from "dotenv";
import { Database } from './db/db';
import http from 'http';
import app from './app';

dotenv.config({ path: './.env' });

class Server {
    private server: http.Server;

    constructor() {
        this.server = http.createServer(app);
    }

    // Method to initialize and connect to the database
    private async initializeDatabase(): Promise<void> {
        try {
            await Database.connect();
        } catch (error) {
            console.log("MongoDB Connection Failed!!", error);
            process.exit(1);
        }
    }


    // Method to start the server
    private startServer(): void {
        this.server.on("error", (error) => {
            console.log(`Server Connection Error: ${error}`);
        });

        this.server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server Connected On Port: ${process.env.PORT || 8000}\n`);
        });
    }

    public async initialize(): Promise<void> {
        await this.initializeDatabase();  // Initialize the database
        this.startServer();  // Start the server
    }
}

const server = new Server();
server.initialize();