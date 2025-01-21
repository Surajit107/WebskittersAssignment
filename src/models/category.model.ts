import mongoose, { Schema, Model } from 'mongoose';
import { Schemas } from "../../types/schemaTypes";

const CategorySchema: Schema<Schemas.ICategory> = new Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const CategoryModel: Model<Schemas.ICategory> = mongoose.model<Schemas.ICategory>("Category", CategorySchema);

export default CategoryModel;