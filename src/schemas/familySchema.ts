import { Schema, Document, model } from "mongoose";

interface IFamily extends Document {
    guildId?: string;
    familyName?: string;
    familyLevel?: number;
    familyTag?: string;
    familyDescription?: string;
    familyIcon?: string;
    familyBanner?: string;
    familyOwner?: string;
    familyCreatedAt?: number;
    familyMembers?: string[];
    familyAlliance?: string[];
    familyChat?: string;
    familyRole?: string;
    familyMoney?: number;
    memberLimit?: number;
}

const familySchema = new Schema<IFamily>({
    guildId: { type: String },
    familyName: { type: String },
    familyLevel: { type: Number },
    familyTag: { type: String },
    familyDescription: { type: String },
    familyIcon: { type: String },
    familyBanner: { type: String },
    familyOwner: { type: String },
    familyCreatedAt: { type: Number },
    familyMembers: { type: [String] },
    familyAlliance: { type: [String] },
    familyMoney: { type: Number },
    familyChat: { type: String },
    familyRole: { type: String },
    memberLimit: { type: Number },
});

export default model<IFamily>("Family", familySchema);