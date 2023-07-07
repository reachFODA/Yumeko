/* eslint-disable no-useless-escape */
import { ActionRowBuilder, ApplicationCommandType, Colors, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import Level from "../../schemas/levelSchema";

export default new Command({
    name: 'trabalho',
    description: '[💸 Economia ] Selecione o trabalho.',
    type: ApplicationCommandType.ChatInput,
    async execute({ interaction }){

        await interaction.deferReply({ ephemeral: false })

        const level = await Level.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild?.id
        })

        const embed = new EmbedBuilder({
            title: 'Escolha um trabalho',
            description: `Olá ${interaction.user.username}, basta escolher um trabalho abaixo.`,
            color: Colors.Blue,
            author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() },
            timestamp: new Date(),
            fields: 
            [
                {
                    name: '🗑️ Lixeiro',
                    value: '\`Nível: 0\`',
                    inline: true
                },
                {
                    name: '🍕 Entregador de pizza',
                    value: '\`Nível: 10\`',
                    inline: true
                },
                {
                    name: '🧑‍🏭 Engenheiro',
                    value: '\`Nível: 30\`',
                    inline: true
                },
                {
                    name: '🧑‍✈️ Piloto',
                    value: '\`Nível: 50\`',
                    inline: true
                },
                {
                    name: '📈 Empreendedor',
                    value: '\`Nível: 70\`',
                    inline: true
                },
                {
                    name: '🧑‍💻 Programador',
                    value: '\`Nível: 100\`',
                    inline: true
                },
            ]
        })

        const menu = new StringSelectMenuBuilder({
            customId: 'workMenu',
            options: 
            [
                {
                    label: 'Lixeiro',
                    value: 'garbageman',
                    emoji: '🗑️'
                },
            ]
        })


        const msg = await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder<StringSelectMenuBuilder>({
                components: [menu]
            })]
        })


    }
})