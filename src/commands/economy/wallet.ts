import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import User from "../../schemas/userSchema";
import { FormatUtils } from "../../utils/FormatUtils";

export default new Command({
    name: 'carteira',
    description: '[💸 Economia ] Veja quantos dinheiro você tem.',
    type: ApplicationCommandType.ChatInput,
    async execute({ interaction }){

        await interaction.deferReply({ ephemeral: false })

        const member = await User.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild?.id
        })

        if (member) {

        const embed = new EmbedBuilder({
            title: `Carteira de ${interaction.user.username}`,
            description: `
            \`💸 Dinheiro: \`${FormatUtils.FormatNumber(member?.money)}
            \`🏦 Banco: \`${FormatUtils.FormatNumber(member?.bank)}
            \`💰 Total: \`${FormatUtils.FormatNumber(member?.bank + member?.money)}`,
            color: Colors.Blue
        })

        await interaction.editReply({
            embeds: [embed]
        })
    }

    }
})