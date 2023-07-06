import { ApplicationCommandOptionType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import User from "../../schemas/userSchema";
import shop from "../../config/shop.json";

export default new Command({
    name: "loja",
    description: "[💸 Economia ] Abra o menu da itens da loja.",
    options: [
        {
            name: "lista",
            description: "Veja os itens disponíveis.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "comprar",
            description: 'Comprar algum item na loja.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "item",
                    description: "Compre algum item.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ]
        }
    ],
    async execute({ interaction, options }) {

        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case "lista":
                {
                    await interaction.deferReply({ ephemeral: false })

                    const embed = new EmbedBuilder({
                        title: 'Veja os itens da loja.',
                        description: `
                        \`booster\` R$${FormatUtils.FormatNumber(shop.shop[0].booster_cost)} - Ele vai aumentar sua fonte de renda em x${shop.shop[0].booster}.
                        \`tempo-de-trabalho\` R$${FormatUtils.FormatNumber(shop.shop[0].work_reduce_cost)} - Ele vai diminuir o tempo de trabalho em ${shop.shop[0].work_reduce_cooldown} segundos.
                        \`tempo-de-roubo\` R$${FormatUtils.FormatNumber(shop.shop[0].crime_reduce_cost)} - Ele va diminuir o tempo de roubo em ${FormatUtils.formatTime(shop.shop[0].reduce_crime_cooldown)} segundos.
                        \`arma\` R$${FormatUtils.FormatNumber(shop.shop[0].gun_cost)} - Com arma você vai conseguir roubar.`,
                        color: Colors.Blue
                    })

                    await interaction.editReply({
                        embeds: [embed]
                    })

                }
                break;
            case "comprar":
                {
                    await interaction.deferReply({ ephemeral: false })

                    const args = options.getString("item");

                    const member = await User.findOne({
                        userId: interaction.user.id,
                        guildId: interaction.guild?.id
                    })

                    if (args != 'booster' && args != 'tempo-de-trabalho' && args != 'tempo-de-roubo' && args != 'arma') return interaction.editReply('Esse item não existe.');

                    // Booster
                    if (args.toLowerCase() == 'booster') {
                        if (member?.booster as number > shop.shop[0].booster_max) return interaction.editReply('Você já tem o máximo de upgrades de booster.')
                        if (member?.money as number < shop.shop[0].booster_cost) return interaction.editReply(`Você precisa de R$${FormatUtils.FormatNumber(shop.shop[0].booster_cost)}`)

                        if (member) {
                            member.money -= shop.shop[0].booster_cost;
                            member.booster += shop.shop[0].booster
                            member.save();

                            interaction.editReply({
                                embeds: [{ title: `Compra efetuada com sucesso`, description: `Você comprou um booster e agora seu booster é de x${member.booster}`, color: Colors.Blue, author: { name: interaction.user.username } }]
                            })
                        }
                    }

                    // Work time
                    if (args.toLowerCase() == 'tempo-de-trabalho'){
                        if (member?.workCooldown_time as number > shop.shop[0].work_max_cooldown_time) return interaction.editReply('Você já tem o máximo de tempo em trabalho.');
                        if (member?.money as number < shop.shop[0].work_reduce_cost) return interaction.editReply(`Você precisa de R$${FormatUtils.FormatNumber(shop.shop[0].work_reduce_cost)}.`);

                        if (member){
                            member.money -= shop.shop[0].work_reduce_cost;
                            member.workCooldown -= shop.shop[0].work_reduce_cooldown;
                            member.save();
                        }
                    }
                }
            default:
                break;
        }

    },
});
