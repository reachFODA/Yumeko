import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, CommandInteraction, Message } from "discord.js";

export class PageUtils {
  static async setPage(interaction: CommandInteraction, pages: EmbedBuilder[], pageCount: number): Promise<void> {
    const user = interaction.user;
    let currentPage = 0;

    const actionRow = new ActionRowBuilder<ButtonBuilder>({
      components: [
        new ButtonBuilder({
          customId: 'previousPage',
          emoji: '◀',
          style: ButtonStyle.Primary,
          disabled: currentPage === 0 // Desabilita o botão de página anterior na primeira página
        }),
        new ButtonBuilder({
          customId: 'nextPage',
          emoji: '▶',
          style: ButtonStyle.Primary,
          disabled: currentPage === pageCount - 1 // Desabilita o botão de próxima página na última página
        })
      ]
    });

    const message = await interaction.reply({
      embeds: [pages[currentPage]],
      components: [actionRow],
      fetchReply: true
    }) as Message;

    const collector = message.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
      if (!buttonInteraction.deferred) await buttonInteraction.deferUpdate();

      if (buttonInteraction.customId === 'previousPage') {
        currentPage--;
      } else if (buttonInteraction.customId === 'nextPage') {
        currentPage++;
      }

      // Atualiza os botões de página com base na página atual
      actionRow.components[0].setDisabled(currentPage === 0);
      actionRow.components[1].setDisabled(currentPage === pageCount - 1);

      await buttonInteraction.update({ embeds: [pages[currentPage]], components: [actionRow] });
    });
  }
}
