import { Schema, Document, model } from "mongoose";

interface IWork extends Document {
    guildId: string;
    userId: string;
    money: number;
    work: string;
}

const workSchema = new Schema<IWork>({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    money: { type: Number, default: 0 },
    work: { type: String, default: 'Sem emprego' }
});

export default model<IWork>("Work", workSchema);
