import { Event } from "../../structs/types/Event";
import Guild from "../../schemas/guildSchema";

export default new Event({
    name: 'guildCreate',
    async execute(guild) {
        try {
            const existingGuild = await Guild.findOne({ guildId: guild.id });
            if (existingGuild) {
                return;
            }

            const newGuild = new Guild({
                guildId: guild.id,
                familyCategory: 'null'
            });

            await newGuild.save();
            console.log(`New guild with ID ${guild.id} has been added to the database.`);
        } catch (error) {
            console.error("Error occurred while creating the guild document:", error);
        }
    },
});
