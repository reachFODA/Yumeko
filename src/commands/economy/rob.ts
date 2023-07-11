import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import User from "../../schemas/userSchema";

export default new Command({
    name: 'roubar',
    description: '[💸 Economia ] Tente roubar dinheiro de alguém.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione o usuário',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],

    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser('usuário');
        const targetUser = await User.findOne({ userId: user?.id, guildId: interaction.guild?.id });
        const robber = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });

        if (user?.id === interaction.user.id) return interaction.editReply("Você não pode roubar a si mesmo.");
        if (user?.bot) return interaction.editReply("Você não pode roubar um bot.");


        
        if (!targetUser) {
            return interaction.editReply({
                embeds: [
                    {
                        description: "Usuário não registrado no sistema.",
                        color: Colors.Blue,
                    },
                ],
            });
        }

        if (!robber) {
            return interaction.editReply({
                embeds: [
                    {
                        description: "Você não está registrado no sistema.",
                        color: Colors.Blue,
                    },
                ],
            });
        }

        if (!robber.rob) {
            return interaction.editReply({
                embeds: [
                    {
                        description: "Você não pode roubar no momento.",
                        color: Colors.Blue,
                    },
                ],
            });
        }

        const robCooldown = robber.robCooldown_time || 0; // Tempo de cooldown do roubo em segundos
        const baseCooldown = 60 * 60 * 1000; // Cooldown base de 1 hora em milissegundos
        const adjustedCooldown = baseCooldown - robCooldown * 1000; // Cooldown ajustado após a redução

        if ((robber.robCooldown as number) > Date.now()) {
            const calc = (robber.robCooldown as number) - Date.now();

            return interaction.editReply({
                embeds: [
                    {
                        description: `Ainda falta ${FormatUtils.formatTime(calc).minutes} minutos e ${FormatUtils.formatTime(calc).seconds} segundos para você poder roubar novamente.`,
                        color: Colors.Blue,
                    },
                ],
            });
        }

        if (robber.money < 100) {
            return interaction.editReply({
                embeds: [
                    {
                        description: "Você precisa ter no mínimo R$100 para realizar um roubo.",
                        color: Colors.Blue,
                    },
                ],
            });
        }

        const successChance = 0.5; // Chance de sucesso do roubo (50% neste exemplo)
        const isSuccessful = Math.random() < successChance;

        if (isSuccessful) {
            if (targetUser) {
            const amountStolen = Math.floor(targetUser.money* 0.25); // Rouba 25% do dinheiro do alvo
            const booster = robber.booster || 0; // Multiplicador de booster do usuário
            const totalAmount = Math.min(amountStolen, targetUser.money) * (1 + booster);

            robber.money += totalAmount;
            targetUser.money -= totalAmount;

            robber.robCooldown = Date.now() + adjustedCooldown;

            await robber.save();
            await targetUser.save();

            const embed = new EmbedBuilder({
                title: 'Roubo bem-sucedido!',
                description: `Você roubou R$${FormatUtils.FormatNumber(totalAmount)} de ${user}.`,
                color: Colors.Green,
            });
            return interaction.editReply({ embeds: [embed] });
        }
        } else {
            robber.money -= 100; // Penalidade de R$50 por falha no roubo
            robber.robCooldown = Date.now() + adjustedCooldown;

            await robber.save();

            const embed = new EmbedBuilder({
                title: 'Roubo mal-sucedido!',
                description: `Você falhou ao roubar ${user} e perdeu R$100.`,
                color: Colors.Red,
            });

            return interaction.editReply({ embeds: [embed] });
        }
    },
});
