import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import User from "../../schemas/userSchema";
import Level from "../../schemas/levelSchema";
import Work from "../../schemas/workSchema";

export default new Command({
    name: 'perfil',
    description: '[🕴️Social] Veja o perfil de algum usuário ou o seu.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione algum usuário.',
            type: ApplicationCommandOptionType.User
        }
    ],
    async execute({ interaction, options }){

        await interaction.deferReply({ ephemeral: false });

        const user = options.getUser('usuário') || interaction.user;

        const mention = user ? user.id : interaction.user.id;
        const userName = user ? user.username : interaction.user.username;
        const avatarURL = user ? user.displayAvatarURL({ extension: "png", size: 512 }) : interaction.user.displayAvatarURL({ extension: "png", size: 512 });

        const member = await User.findOne({ userId: mention, guildId: interaction.guild?.id });
        const work = await Work.findOne({ userId: mention, guildId: interaction.guild?.id });
        const level = await Level.findOne({ userId: mention, guildId: interaction.guild?.id });

        const embed = new EmbedBuilder({
            title: `Perfil de ${userName}`,
            description: `Você está visualizando o perfil de ${userName}`,
            color: Colors.Blue,
            author: { name: userName, iconURL: avatarURL },
            fields: [
                {
                    name: 'Nome:',
                    value: `${userName}`,
                    inline: true
                },
                {
                    name: 'Emprego:',
                    value: `${work?.work}`,
                    inline: true
                },
                {
                    name: 'Casado:',
                    value: '💞 ...',
                    inline: true
                },
                {
                    name: 'Reputação:',
                    value: '💎 ...',
                    inline: true
                },
                {
                    name: 'Nível:',
                    value: `${level?.level} ⭐`,
                    inline: true
                },
            ]
        })

        await interaction.editReply({
            embeds: [embed]
        })

    }
})