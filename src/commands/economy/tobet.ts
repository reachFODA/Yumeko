import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import User from "../../schemas/userSchema";

export default new Command({
    name: 'apostar',
    description: '[💸 Economia ] Selecione algum usuário.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione algum usuário.',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'quantidade',
            description: 'Selecione a quantidae.',
            type: ApplicationCommandOptionType.Number,
            minValue: 100,
            required: true
        }
    ],
    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const user = options.getUser('usuário');
        const amount = options.getNumber('quantidade') as number;

        if (interaction.user.id == user?.id) return interaction.editReply(`Você não pode apostar com si mesmo.`);
        if (user?.bot) return interaction.editReply('Você não pode apostar com bot.');

        const member = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });
        const target = await User.findOne({ userId: user?.id, guildId: interaction.guild?.id });

        if (member?.money as number < amount) {
            interaction.editReply(`Você precisa de \`R$${FormatUtils.FormatNumber(amount)}\` para apostar.`);
        } else if (target?.money as number < amount) {
            interaction.editReply(`O usuário \`${user}\` não possui \`R$${FormatUtils.FormatNumber(amount)}\` para apostar.`)
        } else {

            const competitors = [user, interaction.user];
            const win = competitors[Math.floor(Math.random() * competitors.length)];

            const embed = new EmbedBuilder({
                title: 'APOSTA!',
                description: `Olá ${user}, o usuário ${interaction.user} deseja apostar \`R$${FormatUtils.FormatNumber(amount)}\` com você!\nClique abaixo para aceitar a aposta.`,
                color: Colors.Blue
            })

            const button = new ButtonBuilder({
                customId: 'accept',
                emoji: '💲',
                label: 'Aceitar aposta!',
                style: ButtonStyle.Success
            })

            const msg = await interaction.editReply({
                embeds: [embed],
                components: [new ActionRowBuilder<ButtonBuilder>({
                    components: [button]
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


                if (win?.id === user?.id) {
                    if (member && target) {
                        subInteraction.reply(`Parabéns ${win}! Você ganhou \`R$${FormatUtils.FormatNumber(amount)}\` de ${interaction.user} apostando com ele.`);

                        member.money -= amount;
                        member.save();

                        target.money += amount;
                        target.save();
                    }
                } else if (win?.id === interaction.user.id) {
                    if (member && target) {
                        subInteraction.reply(`Parabéns ${win}! Você ganhou \`R$${FormatUtils.FormatNumber(amount)}\` de ${user} apostando com ele.`);

                        member.money += amount;
                        member.save();

                        target.money -= amount;
                        target.save();
                    }
                }

            })

            collector.on("end", () => {

                const button = new ButtonBuilder({
                    customId: 'accept',
                    emoji: '💲',
                    label: 'Aceitar aposta!',
                    style: ButtonStyle.Success,
                    disabled: true
                })

                msg.edit({
                    components: [new ActionRowBuilder<ButtonBuilder>({
                        components: [button]
                    })]
                })

            })


        }
    }
})