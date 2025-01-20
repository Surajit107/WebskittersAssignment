import mongoose from "mongoose";
import { Config } from "../constants";
import { CommonTypes } from "../../types/commonType";


export class Database {
    private static instance: Database;

    private constructor() { }

    // Public method to connect to the database
    public static async connect(): Promise<void> {
        try {
            // Establishing the connection to MongoDB
            const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${Config.DB_NAME}`);

            // Get the current date and time
            const currentDate = new Date().toLocaleString();
            const dbInfo: CommonTypes.DBInfo = {
                STATUS: "Connected 🌐",
                HOST: connectionInstance.connection.host,
                DATE_TIME: currentDate
            };

            console.log("\n🛢  MongoDB Connection Established");
            console.table(dbInfo);
        } catch (error) {
            console.log("MongoDB Connection Error", error);
            process.exit(1);
        }
    }

    // Static method to get the instance of the class (singleton pattern)
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}