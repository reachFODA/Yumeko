import { ApplicationCommandOptionType, ApplicationCommandType, CategoryChannel } from "discord.js";
import { Command } from "../../structs/types/Commands";
import Guild from "../../schemas/guildSchema";

export default new Command({
    name: 'config',
    description: '[🛡️ Admin] Comandos de administração.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'categoria',
            description: '[🛡️ Admin] Comandos de categoria.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'familia',
                    description: 'Selecione a categoria de família.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'categoria',
                            description: 'Selecione a categoria.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true
                        }
                    ]
                }
            ]
        }
    ],
    async execute({ interaction, options }) {
        const guildId = interaction.guild?.id;
        if (!guildId) {
            return;
        }

        const existingGuild = await Guild.findOne({ guildId });

        if (!existingGuild) {
            const category = options.getChannel("categoria") as CategoryChannel
            if (!category.id) {
                return;
            }

            const newGuild = new Guild({
                guildId,
                familyCategory: category.id,
            });

            await newGuild.save();
        } else {
            const category = options.getChannel("categoria") as CategoryChannel
            if (!category.id) {
                return;
            }

            existingGuild.familyCategory = category.id;
            await existingGuild.save();
        }

        await interaction.reply({
            content: 'Configurado com sucesso.',
            ephemeral: true
        })
    },
});