/* eslint-disable no-useless-escape */
import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import { DatabaseUtils } from "../../utils/DatabaseUtils";
import User from "../../schemas/userSchema";

export default new Command({
    name: 'carteira',
    description: '[💸 Economia ] Veja quantos dinheiro você tem.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'usuário',
        description: 'Selecione um usuário',
        type: ApplicationCommandOptionType.User
    }],
    async execute({ interaction, options }){

        await interaction.deferReply({ ephemeral: false })

        const user = options.getUser("usuário") || interaction.user;
        const mention = user ? user.id : interaction.user.id;
        const userName = user ? user.username : interaction.user.username;
        const avatarURL = user ? user.displayAvatarURL({ extension: "png", size: 512 }) : interaction.user.displayAvatarURL({ extension: "png", size: 512 });

        const member = await User.findOne({ userId: mention, guildId: interaction.guild?.id })

        DatabaseUtils.registerUser(interaction.guild?.id as string, mention)

        const bot = user ? user.bot : interaction.user.bot;
        if (bot) return interaction.editReply("Você não pode ver o dinheiro dos bots.");

        if (member) {

        const embed = new EmbedBuilder({
            title: `Carteira de ${userName}`,
            description: `Utilize \`/rank money\` para ver o ranking de money.`,
            color: Colors.Blue,
            author: { name: userName, iconURL: avatarURL },
            thumbnail: { url: interaction.guild?.iconURL() as string },
            timestamp: new Date(),
            fields:
            [
                {
                    name: '\`💸 Dinheiro:\`',
                    value: `R$${FormatUtils.FormatNumber(member?.money)}`,
                    inline: true
                },
                {
                    name: '\`🏦 Banco:\`',
                    value: `R$${FormatUtils.FormatNumber(member?.bank)}`,
                    inline: true
                },
                {
                    name: '\`💰 Total:\`',
                    value: `R$${FormatUtils.FormatNumber(member?.bank + member?.money)}`,
                    inline: true
                }
            ]
        });

        await interaction.editReply({
            embeds: [embed]
        })
    }

    }
})