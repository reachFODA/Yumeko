import { Schema, Document, model } from "mongoose";

interface IGuild extends Document {
    guildId: string;
    familyCategory: string;
}

const guildSchema = new Schema<IGuild>({
    guildId: { type: String, required: true },
    familyCategory: String,
});

export default model<IGuild>("Guild", guildSchema);
