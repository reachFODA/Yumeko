import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import User from "../../schemas/userSchema";
import Work from "../../schemas/workSchema";

export default new Command({
    name: 'trabalhar',
    description: '[💸 Economia ] Ganhe dinheiro trabalhando.',
    type: ApplicationCommandType.ChatInput,
    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const member = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });
        const work = await Work.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });

        if (!work) {
            return interaction.editReply({
                embeds: [
                    {
                        description: "Você não tem um emprego.",
                        color: Colors.Blue,
                    },
                ],
            });
        }

        if ((member?.workCooldown as number) > Date.now()) {
            const calc = (member?.workCooldown as number) - Date.now();

            return interaction.editReply({
                embeds: [
                    {
                        description: `Ainda falta ${FormatUtils.formatTime(calc).hours} horas, ${FormatUtils.formatTime(calc).minutes} minutos e ${FormatUtils.formatTime(calc).seconds} segundos.`,
                        color: Colors.Blue,
                    },
                ],
            });
        }

        if (member) {
            const cooldownReduction = member.workCooldown_time || 0; // Redução de cooldown da loja em segundos
            const baseCooldown = 24 * 60 * 60 * 1000; // Cooldown base de 1 dia em milissegundos
            const adjustedCooldown = baseCooldown - cooldownReduction * 1000; // Cooldown ajustado após a redução

            member.workCooldown = Date.now() + adjustedCooldown;

            const calc = (member.workCooldown as number) - Date.now();

            // Quantidade default
            if (member.booster == 0) {
                member.money += work.money;

                await member.save().then(async () => {
                    const embed = new EmbedBuilder({
                        title: 'Mais um dia com sucesso.',
                        description: `Você trabalhou de ${work.work} e ganhou R$${FormatUtils.FormatNumber(work.money)}.`,
                        color: Colors.Blue,
                        author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() },
                        footer: { text: `Falta ${FormatUtils.formatTime(calc).hours} horas, ${FormatUtils.formatTime(calc).minutes} minutos e ${FormatUtils.formatTime(calc).seconds} segundos.` },
                    });

                    return interaction.editReply({ embeds: [embed] });
                });
            } else {
                // Quantidade boost
                const formatBoost = work.money * member.booster;
                member.money += formatBoost;

                await member.save().then(async () => {
                    const embed = new EmbedBuilder({
                        title: 'Mais um dia com sucesso.',
                        description: `Você trabalhou de ${work.work} e ganhou R$${FormatUtils.FormatNumber(work.money)} (BOOST).`,
                        color: Colors.Blue,
                        author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() },
                        footer: { text: `Falta ${FormatUtils.formatTime(calc).hours} horas, ${FormatUtils.formatTime(calc).minutes} minutos e ${FormatUtils.formatTime(calc).seconds} segundos.` },
                    });

                    return interaction.editReply({ embeds: [embed] });
                });
            }
        }
    },
});
