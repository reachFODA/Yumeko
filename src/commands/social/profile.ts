/* eslint-disable no-useless-escape */
import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { DatabaseUtils } from "../../utils/DatabaseUtils";
import User from "../../schemas/userSchema";
import Work from "../../schemas/workSchema";
import Level from "../../schemas/levelSchema";

export default new Command({
    name: 'perfil',
    description: '[🧑 Social] Veja o perfil de um usuário',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione um usuário.',
            type: ApplicationCommandOptionType.User
        }
    ],
    async execute({ interaction, client }) {

        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser('usuário');
        const mention = user ? user.id : interaction.user.id;
        const userName = user ? user.username : interaction.user.username;
        const avatarURL = user ? user.displayAvatarURL({ extension: "png", size: 512 }) : interaction.user.displayAvatarURL({ extension: "png", size: 512 });

        DatabaseUtils.registerUser(interaction.user.id as string, mention)

        const member = await User.findOne({ guildId: interaction.guild?.id, userId: mention })
        const work = await Work.findOne({ guildId: interaction.guild?.id, userId: mention })
        const level = await Level.findOne({ guildId: interaction.guild?.id, userId: mention })

        const marryUser = !member?.married_to ? "Não está casado" : client.users.cache.get(member.married_to)?.username;

        const randomtip = [
            "Você sabia que você pode ver seu dinheiro com /carteira",
            "Tá gostando de uma pessoa? que tal usar o /casar com ela",
            "Resgatou o seu /daily hoje?",
            "Hora de ganhar um money extra, não acha? /trabalhar",
            "Não sabe onde gastar os seus coins? Seria uma boa dar uma olhada no /loja",
        ];

        const tip = randomtip[Math.floor(Math.random() * randomtip.length)];

        const embed = new EmbedBuilder({
            description: `Você está visualizando o perfil de ${userName}`,
            thumbnail: { url: avatarURL },
            fields: [
              { name: "Nome:", value: `\`${userName}\``, inline: true },
              { name: "Booster:", value: `\`${member?.booster}💠\``, inline: true },
              { name: "Casado:", value: `\`💞 ${marryUser}\``, inline: true },
              { name: "Reputação:", value: `\`${member?.rep || 0} ${member?.rep && member?.rep > 1 ? '💎 reputações\`' : '💎 reputação\`'}`, inline: true },
              { name: "Nível:", value: `\`${level?.level} ⭐ Níveis\``, inline: true },
              { name: "Trabalho:", value: `\`${work?.work ?? 'Sem emprego'}\``, inline: true }
            ],
            footer: { text: `Dica: ${tip}` },
            timestamp: new Date,
            color: Colors.Blue,
          });

        await interaction.editReply({
            embeds: [embed]
        })
          

    }
})