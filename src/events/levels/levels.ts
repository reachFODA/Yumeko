import { Event } from "../../structs/types/Event";
import { FormatUtils } from "../../utils/FormatUtils";
import Level from "../../schemas/levelSchema";
import { DatabaseUtils } from "../../utils/DatabaseUtils";

function getRandomXp(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default new Event({
    name: "messageCreate",
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        DatabaseUtils.registerUser(message.guild.id as string, message.author.id as string)

        const xpToGive = getRandomXp(5, 15);

        const query = {
            userId: message.author.id,
            guildId: message.guild.id,
        };

        try {
            const level = await Level.findOne(query);

            if (level) {
                level.xp += xpToGive;

                if (level.xp > FormatUtils.calculateLevelXp(level.level)) {
                    level.xp = 0;
                    level.level += 1;

                    await level.save().catch((e) => {
                        console.log(`Error saving updated level ${e}`);
                        return;
                    });

                    setTimeout(() => {
                        message.channel
                            .send({
                                content: `Parabéns ${message.member}, você agora é **level ${level.level}**.`,
                            })
                            .then((mg) => setTimeout(mg.delete.bind(mg), 10000));
                    }, 5000);
                } else {
                    await level.save().catch((e) => {
                        console.log(`Error saving updated level ${e}`);
                        return;
                    });
                }
            } else {
                const newLevel = new Level({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    xp: xpToGive,
                });

                await newLevel.save();
            }
        } catch (error) {
            console.log(`Error giving xp: ${error}`);
        }
    },
});