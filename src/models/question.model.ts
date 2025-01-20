import mongoose, { Schema, Document, Model } from 'mongoose';
import { Schemas } from "../../types/schemaTypes";


const QuestionSchema: Schema<Schemas.IQuestion> = new Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
    }],
    correctAnswer: {
        type: String,
        required: true,
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
    }],
}, { timestamps: true });


const QuestionModel: Model<Schemas.IQuestion> = mongoose.model<Schemas.IQuestion>("Question", QuestionSchema);

export default QuestionModel;