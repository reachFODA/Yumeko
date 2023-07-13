import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import htfull from "hmfull"

export default new Command({
    name: 'wallpaper',
    description: '[🖼️ Imagem] Baixa um wallpaper para seu desktop ou mobile.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'pc',
            description: 'Baixa um wallpaper para desktop.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'mobile',
            description: 'Baixa um wallpaper para seu celular.',
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    async execute({ interaction, options }) {

        const subCommand = options.getSubcommand(true);

        switch (subCommand) {
            case "pc":
                {
                    await interaction.deferReply({ ephemeral: false })

                    const image = (await htfull.HMtai.sfw.wallpaper()).url

                    const embed = new EmbedBuilder({
                        title: `Wallpaper desktop`,
                        image: { url: image },
                        description: `Imagem solicitada por ${interaction.user}.`,
                        author: { name: interaction.user.username, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                        color: Colors.Blue,
                        timestamp: new Date
                    })

                    const button = new ButtonBuilder({
                        label: 'Clique para baixar!',
                        style: ButtonStyle.Link,
                        url: image
                    })

                    await interaction.editReply({
                        embeds: [embed],
                        components: [new ActionRowBuilder<ButtonBuilder>({
                            components: [button]
                        })]
                    })

                }
                break;
            case "mobile":
                {
                    await interaction.deferReply({ ephemeral: false })

                    const image = (await htfull.HMtai.sfw.mobileWallpaper()).url

                    const embed = new EmbedBuilder({
                        title: `Wallpaper mobile`,
                        image: { url: image },
                        description: `Imagem solicitada por ${interaction.user}.`,
                        author: { name: interaction.user.username, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                        color: Colors.Blue,
                        timestamp: new Date
                    })

                    const button = new ButtonBuilder({
                        label: 'Clique para baixar!',
                        style: ButtonStyle.Link,
                        url: image
                    })

                    await interaction.editReply({
                        embeds: [embed],
                        components: [new ActionRowBuilder<ButtonBuilder>({
                            components: [button]
                        })]
                    })

                }
                break;

        }

    }
})