import { ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Commands";

export default new Command({
    name: "ping",
    description: "Veja a ping do client.",
    type: ApplicationCommandType.ChatInput,

    async execute({ interaction, client }) {

        await interaction.deferReply({ ephemeral: false })

        await interaction.editReply({
            content: `:ping_pong: **|** **Lâtencia:** ${Date.now() - interaction.createdTimestamp
                }ms **Latência da API:** ${Math.round(client.ws.ping)}ms`
        })

    },
})