import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from 'discord.js';
import { Command } from '../../structs/types/Commands';
import { FormatUtils } from '../../utils/FormatUtils';
import User from '../../schemas/userSchema';

export default new Command({
  name: 'depositar',
  description: '[💸 Economia ] Depositar o dinheiro no banco.',
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

    if (typeof args === 'string' && member && typeof member.money === 'number') {
      const argsAsNumber = parseInt(args);

      if (argsAsNumber > member.money) {
        const embed = new EmbedBuilder({
          description: 'Você não tem dinheiro suficiente para depositar este valor.',
          author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
          color: Colors.Blue,
          timestamp: new Date(),
        });

        await interaction.editReply({
          embeds: [embed],
        });
      }
    }

    // Depositar tudo
    if (args?.toLowerCase() == 'tudo') {
      const embed = new EmbedBuilder({
        description: `Você depositou R$${FormatUtils.FormatNumber(member?.money as number)} na sua conta bancária.`,
        author: { name: interaction.user.username, iconURL: interaction.user.avatarURL() as string },
        color: Colors.Blue,
        timestamp: new Date(),
      });

      if (member) {
        member.bank += member.money;
        member.money = 0;

        await member.save();
        await interaction.editReply({
          embeds: [embed],
        });
      }
    } else {
      // Retirar quantidade
      if (member) {
        member.bank += parseInt(args ?? '');
        member.money -= parseInt(args ?? '');

        const embed = new EmbedBuilder({
          description: `Você depositou R$${FormatUtils.FormatNumber(parseInt(args ?? ''))} na sua conta bancária.`,
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
