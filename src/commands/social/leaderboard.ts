import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import { PageUtils } from "../../utils/PageUtils";
import User from "../../schemas/userSchema";

export default new Command({
    name: 'ranking',
    description: '[🧑 Social] Veja os rankings.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'money',
            description: '[💸 Economia ] Veja o top money.',
            type: ApplicationCommandOptionType.Subcommand
        },
    ],
    async execute({ interaction, options, client }) {

        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case "money":
                {

                    const member = await User.find({ guildId: interaction.guild?.id })

                    let pagesNum = Math.ceil(member.length / 10);
                    if (pagesNum === 0) pagesNum = 1;

                    member.sort((a, b) => {
                        return b.money + b.bank - (a.money + a.bank);
                    });

                    const userStrings = [];
                    for (let i = 0; i < member.length; i++) {
                        const e = member[i];
                        const fetch = await client.users.fetch(e.userId);
                        userStrings.push(
                            `**${i + 1}.** ${client.users.cache.get(
                                fetch.id
                            )} \`R$${FormatUtils.FormatNumber(e.money + e.bank)}\``);
                    }

                    const pages = [];
                    for (let i = 0; i < pagesNum; i++) {
                        const str = userStrings.slice(i * 10, i * 10 + 10).join("\n"); // Adiciona uma nova linha entre os usuários
                    
                        const embed = new EmbedBuilder({
                            author: { name: `🏆 - ${interaction.guild?.name} Top Money`, iconURL: interaction.guild?.iconURL({ forceStatic: true }) as string },
                            thumbnail: { url: interaction.guild?.iconURL({ forceStatic: true }) as string },
                            description: `${str == "" ? "Sem usuários" : str}`, // Remove a nova linha em branco se não houver usuários
                            color: Colors.Blue,
                            footer: { text: `Página • ${i + 1}/${pagesNum} | ${member.length} • Total Membros` }
                        });
                    
                        pages.push(embed);
                    }                    

                    await PageUtils.setPage(interaction, pages, pagesNum)
                }
                break;
        }

    }
})