import { Request, Response } from 'express';
import { ApiError } from "../utils/ApiError";
import mongoose from 'mongoose';
import os from 'os';
import { ReqResTypes } from "../../types/requests_responseType";


export class HealthCheckController {
    // Method to handle the health check
    public handle = async (req: Request, res: Response): Promise<void> => {
        try {
            const networkInterfaces = os.networkInterfaces();

            // Extract IPv4 addresses
            const IPv4Addresses = Object.values(networkInterfaces)
                .flat()
                .filter((interfaceInfo): interfaceInfo is os.NetworkInterfaceInfo =>
                    interfaceInfo !== undefined && interfaceInfo.family === 'IPv4')
                .map(interfaceInfo => interfaceInfo.address);

            const message: ReqResTypes.HealthcheckResponse = {
                host: IPv4Addresses,
                time: new Date(),
                message: '',
                status: false
            };

            if (mongoose.connection.name) {
                // If MongoDB connection is healthy
                message.message = 'Healthy';
                message.status = true;
                res.status(200).json({ response: message });
            } else {
                // If MongoDB connection is unhealthy
                message.message = 'Unhealthy';
                message.status = false;
                res.status(501).json({ response: message });
            }
        } catch (error: any) {
            next(new ApiError(500, (error as Error).message));
        }
    };
}

function next(arg0: ApiError) {
    throw new Error('Function not implemented.');
}
