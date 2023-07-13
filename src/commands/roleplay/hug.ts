import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import hmfull from 'hmfull';

export default new Command({
    name: 'abraçar',
    description: '[💥 Roleplay ] Abraçar algum usuário.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione algum usuário.',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const user = options.getUser('usuário');

        if (interaction.user.id == user?.id) return interaction.editReply(`Você não pode abraçar a si mesmo.`);
        
        const bot = user ? user.bot : interaction.user.bot;
        if (bot) return interaction.editReply("Você não pode abraçar os bots.");

        const fortunes = [
            'abraço',
            'abraço quente',
            'abraço errado',
            'abraço apertado',
        ]

        const image = (await hmfull.HMtai.sfw.hug()).url

        const embed = new EmbedBuilder({
            description: `O(a) ${interaction.user} deu um ${fortunes[Math.floor(Math.random() * fortunes.length)]} em ${user}.`,
            image: { url: image },
            color: Colors.Blue,
            timestamp: new Date
        })

        const button = new ButtonBuilder({
            customId: 'hugButton',
            label: 'Retribuir',
            style: ButtonStyle.Primary
        })

        const button2 = new ButtonBuilder({
            style: ButtonStyle.Link,
            url: image,
            label: 'Fonte da imagem'
        })

        const msg = await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder<ButtonBuilder>({
                components: [button, button2]
            })]
        })

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30_000 })
        collector.on("collect", async subInteraction => {

            if (subInteraction.user.id !== user?.id) {
                subInteraction.reply({
                    content: "Você não tem permissão para interagir com este botão.",
                    ephemeral: true,
                });
                return;
            }

            const image = (await hmfull.HMtai.sfw.hug()).url

            const embed = new EmbedBuilder({
                description: `O(a) ${subInteraction.user} retribuiu um ${fortunes[Math.floor(Math.random() * fortunes.length)]} para ${interaction.user}.`,
                image: { url: image },
                color: Colors.Blue,
                timestamp: new Date
            })

            const button = new ButtonBuilder({
                style: ButtonStyle.Link,
                url: image,
                label: 'Fonte da imagem'
            })

            await subInteraction.reply({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>({
                    components: [button]
                })]
            })

            collector.stop();
        })

        collector.on("end", () => {

            const button = new ButtonBuilder({
                customId: 'hugButton',
                label: 'Retribuir',
                style: ButtonStyle.Primary,
                disabled: true
            })

            msg.edit({
                components: [new ActionRowBuilder<ButtonBuilder>({
                    components: [button, button2]
                })]
            })
        })

    }
})