import { Schema, Document, model } from "mongoose";

interface ILevel extends Document {
    guildId: string;
    userId: string;
    xp: number;
    level: number
}

const levelSchema = new Schema<ILevel>({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 }
});

export default model<ILevel>("Level", levelSchema);
