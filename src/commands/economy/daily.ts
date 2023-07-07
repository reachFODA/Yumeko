import { Colors } from 'discord.js';
import User from '../../schemas/userSchema';
import { Command } from '../../structs/types/Commands';
import { FormatUtils } from '../../utils/FormatUtils';

export default new Command({
  name: 'daily',
  description: '[💸 Economia ] Resgate sua recompensa diária.',
  async execute({ interaction }) {
    await interaction.deferReply({ ephemeral: false });

    const member = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
    });

    if ((member?.dailyCooldown as number) > Date.now()) {
      const calc = (member?.dailyCooldown as number) - Date.now();

      return interaction.editReply({
        embeds: [
          {
            description: `Ainda falta ${FormatUtils.formatTime(calc).hours} horas, ${
              FormatUtils.formatTime(calc).minutes
            } minutos e ${FormatUtils.formatTime(calc).seconds} segundos.`,
            color: Colors.Blue,
          },
        ],
      });
    }

    if (member) {
      member.money += 1000;
      member.dailyCooldown = Date.now() + 86400000;
      member.save();

      return interaction.editReply({
        embeds: [{ description: `💰 Você coletou do seu daily \` 1.000 \` de dinheiro.`, color: Colors.Blue }],
      });
    }
  },
});
