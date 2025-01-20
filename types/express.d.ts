import { Schemas } from "./schemaTypes";

declare global {
    namespace Express {
        interface Request {
            user?: Schemas.IUser;
        }
    }
}