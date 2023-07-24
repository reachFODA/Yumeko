import User from "../schemas/userSchema";

export class DatabaseUtils {

    public static async registerUser(guildId: string, userId: string){

        const newuser = await User.findOne({ guildId: guildId, userId: userId });

        if (!newuser){
            const newDatabase = await new User({
                guildId: guildId,
                userId: userId,
                money: 0,
                bank: 0,
                rob: false,
                married: false,
                married_to: "",
                rep: 0,
                robCooldown: 0,
                robCooldown_time: 0,
                workCooldown: 0,
                workCooldown_time: 0,
                dailyCooldown: 0,
                repCooldown: 0,
                booster: 0,
            });
            await newDatabase.save();
        }

    }

}
