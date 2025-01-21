import mongoose, { Schema, Model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Schemas } from "../../types/schemaTypes";

// Define Mongoose schema for User
const UserSchema: Schema<Schemas.IUser> = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email Address is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String,
        default: "",
    },
    refreshToken: {
        type: String,
        default: "",
    },
    answers: [{
        question: { type: Schema.Types.ObjectId, ref: 'Question' },   // Question the user answered
        selectedAnswer: { type: String },                             // User's selected answer
        submittedAt: {
            type: Number,                                             // Store Unix timestamp (in seconds)
            default: Math.floor(Date.now() / 1000)                    // Default value is the current Unix timestamp
        },
    }],
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Hash password before saving user
UserSchema.pre("save", async function (next) {
    const user = this as Schemas.IUser;
    if (!user.isModified("password")) return next();
    try {
        user.password = await bcrypt.hash(user.password, 10);
        next();
    } catch (err: any) {
        next(err);
    }
});

// Add methods to the schema for password validation and token generation
UserSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    const user = this as Schemas.IUser;
    return bcrypt.compare(password, user.password);
};

UserSchema.methods.generateAccessToken = function (): string {
    const user = this as Schemas.IUser;
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

UserSchema.methods.generateRefreshToken = function (): string {
    const user = this as Schemas.IUser;
    return jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const UserModel: Model<Schemas.IUser> = mongoose.model<Schemas.IUser>("User", UserSchema);

export default UserModel;