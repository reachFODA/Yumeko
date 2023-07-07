/* eslint-disable no-useless-escape */
import { ActionRowBuilder, ApplicationCommandType, Colors, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import Level from "../../schemas/levelSchema";
import Work from "../../schemas/workSchema";

export default new Command({
    name: 'trabalho',
    description: '[💸 Economia ] Selecione o trabalho.',
    type: ApplicationCommandType.ChatInput,
    async execute({ interaction }) {

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
                    {
                        label: 'Entregador de pizza',
                        value: 'deliveryman',
                        emoji: '🍕'
                    },
                    {
                        label: 'Engenheiro',
                        value: 'engineer',
                        emoji: '🧑‍🏭'
                    },
                    {
                        label: 'Piloto',
                        value: 'pilot',
                        emoji: '🧑‍✈️'
                    },
                    {
                        label: 'Empreendedor',
                        value: 'entrepreneur',
                        emoji: '📈'
                    },
                    {
                        label: 'Programador',
                        value: 'developer',
                        emoji: '🧑‍💻'
                    }
                ]
        })


        const msg = await interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder<StringSelectMenuBuilder>({
                components: [menu]
            })]
        })

        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });
        collector.on("collect", async (subInteraction) => {
            if (subInteraction.user.id !== subInteraction.guild?.ownerId) {
                subInteraction.reply({
                    content: "Você não é o dono da interação.",
                    ephemeral: true,
                });
                return;
            }

            const options = subInteraction.values[0];

            switch (options) {
                case "garbageman": {

                    const workProfile = await Work.findOne({
                        userId: subInteraction.user.id,
                        guildId: subInteraction.guild?.id,
                        work: "🗑️ Lixeiro",
                    });

                    if (workProfile) {
                        subInteraction.reply({
                            content: "Você já trabalha como lixeiro.",
                            ephemeral: true,
                        });
                        return;
                    }

                    const newWorkProfile = new Work({
                        guildId: subInteraction.guild?.id,
                        userId: subInteraction.user.id,
                        work: "🗑️ Lixeiro",
                        money: "300",
                    });

                    await newWorkProfile.save().then(() => {
                        const embed = new EmbedBuilder({
                            title: "Você escolheu o trabalho de lixeiro.",
                            description: "Parabéns, agora você vai começar com um salário de R$300",
                            color: Colors.Blue,
                            author: { name: subInteraction.user.username, iconURL: subInteraction.user.displayAvatarURL() },
                            timestamp: new Date(),
                        });

                        subInteraction.update({
                            embeds: [embed],
                            components: [],
                        });
                    });

                    return;
                }
                case "deliveryman":
                    {

                        const workProfile = await Work.findOne({
                            userId: subInteraction.user.id,
                            guildId: subInteraction.guild?.id,
                            work: "🍕 Entregador de pizza",
                        });

                        if (workProfile) {
                            subInteraction.reply({
                                content: 'Você já trabalha de Entregador de pizza.',
                                ephemeral: true
                            })
                            return;
                        }

                        //  Não terminado...

                        break;
                    }
                }
            });

        collector.on("end", () => {
            msg.edit({
                embeds: [],
                components: [],
                content: "Fim da interação.",
            });
        });



    }
})