import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from 'discord.js';
import { Command } from '../../structs/types/Commands';
import { FormatUtils } from '../../utils/FormatUtils';
import User from '../../schemas/userSchema';

export default new Command({
  name: 'retirar',
  description: '[💸 Economia] Retirar dinheiro do banco.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'quantidade',
      description: 'Selecione a quantidade ou tudo.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  async execute({ interaction, options }) {
    await interaction.deferReply({ ephemeral: false });

    const args = options.getString('quantidade');
    const filters = ['+', '-'];

    for (const message of filters) {
      if (args?.includes(message)) return interaction.editReply('Você não pode fazer isso!');
    }

    if (isNaN(parseFloat(args ?? '')) && args !== 'tudo') {
      return interaction.editReply('Selecione uma quantidade ou use tudo.');
    }

    const member = await User.findOne({ userId: interaction.user.id, guildId: interaction.guild?.id });

    if (typeof args === 'string' && member && typeof member.bank === 'number') {
      const argsAsNumber = parseInt(args);

      if (argsAsNumber > member.bank) {
        const embed = new EmbedBuilder({
          description: 'Você não tem dinheiro suficiente no banco para retirar este valor.',
          author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
          color: Colors.Blue,
          timestamp: new Date(),
        });

        await interaction.editReply({
          embeds: [embed],
        });
      }
    }

    // Retirar tudo
    if (args?.toLowerCase() == 'tudo') {
      const embed = new EmbedBuilder({
        description: `Você retirou R$${FormatUtils.FormatNumber(member?.bank as number)} do seu banco.`,
        author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
        color: Colors.Blue,
        timestamp: new Date(),
      });

      if (member) {
        member.money += member.bank;
        member.bank = 0;

        await member.save();
        await interaction.editReply({
          embeds: [embed],
        });
      }
    } else {
      // Retirar quantidade
      if (member) {
        member.money += parseInt(args ?? '');
        member.bank -= parseInt(args ?? '');

        const embed = new EmbedBuilder({
          description: `Você retirou R$${FormatUtils.FormatNumber(parseInt(args ?? ''))} do seu banco.`,
          author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
          color: Colors.Blue,
          timestamp: new Date(),
        });

        await interaction.editReply({
          embeds: [embed],
        });

        await member.save();
      }
    }
  },
});
