import { Document, ObjectId } from 'mongoose';

export namespace Schemas {
    export interface IUser extends Document {
        _id: string | ObjectId;
        fullName: string;
        email: string;
        password: string;
        avatar: string;
        refreshToken?: string;
        answers: [{
            question: string | ObjectId;
            selectedAnswer: string;
            submittedAt: Date;
        }];
        isPasswordCorrect(password: string): Promise<boolean>;
        generateAccessToken(): string;
        generateRefreshToken(): string;
        isVerified?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }

    export interface ICategory extends Document {
        _id: string | ObjectId;
        categoryName: string;
        createdAt: Date;
    }

    export interface IQuestion extends Document {
        _id: string | ObjectId;
        questionText: string;
        options: string[];
        correctAnswer: string;
        categories: (string | ObjectId)[];
        createdAt: Date;
        updatedAt: Date;
    }
}