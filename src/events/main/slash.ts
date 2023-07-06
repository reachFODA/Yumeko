import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../..";
import { Event } from "../../structs/types/Event";
import { DatabaseUtils } from "../../utils/DatabaseUtils";

export default new Event({
    name: "interactionCreate",
    execute(interaction) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const options = interaction.options as CommandInteractionOptionResolver

        command.execute({ client, interaction, options })

        DatabaseUtils.registerUser(interaction.guild?.id as string, interaction.user.id)
    }
})