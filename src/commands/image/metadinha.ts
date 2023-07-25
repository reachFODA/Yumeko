import { ApplicationCommandOptionType, ApplicationCommandType, AttachmentBuilder, AttachmentData, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { createCanvas, loadImage } from "canvas";

export default new Command({
  name: 'metadinha',
  description: '[🖼️ Imagem ] Junte duas imagens.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Selecione o usuário.',
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'alvo',
      description: 'Selecione o usuário.',
      type: ApplicationCommandOptionType.User,
      required: true
    },
  ],
  async execute({ interaction }) {

    const user = interaction.options.getUser("usuário");
    const target = interaction.options.getUser("alvo");

    if (!user || !target) {
      await interaction.reply('Você precisa fornecer os usuários para a metadinha.');
      return;
    }

    const embed = new EmbedBuilder({
      title: 'Metadinha',
      description: `Aqui está a metadinha de ${user.username} e ${target.username}:`,
      color: Colors.Blue,
    });

    await interaction.reply({ embeds: [embed] });

    const userAvatar = user.displayAvatarURL({ extension: 'png', size: 128 });
    const targetAvatar = target.displayAvatarURL({ extension: 'png', size: 128 });

    const canvas = createCanvas(256, 128);
    const ctx = canvas.getContext('2d');

    const img1 = await loadImage(userAvatar);
    const img2 = await loadImage(targetAvatar);

    ctx.drawImage(img1, 0, 0, 128, 128);
    ctx.drawImage(img2, 128, 0, 128, 128);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), 'metadinhas.png' as AttachmentData);

    await interaction.followUp({ files: [attachment] });
  }
});
