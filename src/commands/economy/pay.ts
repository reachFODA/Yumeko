import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from 'discord.js';
import { Command } from '../../structs/types/Commands';
import { FormatUtils } from '../../utils/FormatUtils';
import User from '../../schemas/userSchema';
import { DatabaseUtils } from '../../utils/DatabaseUtils';

export default new Command({
    name: 'pagar',
    description: '[💸 Economia ] Pagar dinheiro para outra pessoa.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione o usuário para pagar.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'quantidade',
            description: 'Selecione a quantidade a ser paga.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const user = options.getUser('usuário');
        const amount = options.getInteger('quantidade');

        if (!user || !amount) {
            return interaction.editReply('Por favor, forneça um usuário e uma quantidade válida para pagar.');
        }

        DatabaseUtils.registerUser(interaction.guild?.id as string, user.id as string)

        const bot = user ? user.bot : interaction.user.bot;
        if (bot) return interaction.editReply("Você não pode pagar os bots.");

        const sender = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });
        const receiver = await User.findOne({ userId: user.id, guildId: interaction.guild?.id });

        if (!sender || !receiver) {
            return interaction.editReply('Usuário não encontrado. Certifique-se de mencionar um usuário válido.');
        }

        if (amount <= 0) {
            return interaction.editReply('A quantidade a ser paga deve ser maior que zero.');
        }

        if (sender.money < amount) {
            return interaction.editReply('Você não tem dinheiro suficiente para fazer esse pagamento.');
        }

        sender.money -= amount;
        receiver.money += amount;

        await sender.save();
        await receiver.save();

        const embed = new EmbedBuilder({
            description: `Você pagou R$${FormatUtils.FormatNumber(amount)} para ${user.username}.`,
            author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
            color: Colors.Blue,
            timestamp: new Date(),
        });

        await interaction.editReply({
            embeds: [embed],
        });
    },
});
