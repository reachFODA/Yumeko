import { ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";
import User from "../../schemas/userSchema";

export default new Command({
    name: 'divorciar',
    description: '[🧑 Social] Divorce do seu parceiro(a).',
    type: ApplicationCommandType.ChatInput,
    async execute({ interaction }) {

        await interaction.deferReply({ ephemeral: false });

        const your = await User.findOne({ guildId: interaction.guild?.id, userId: interaction.user.id });
        if (!your?.married) {
            interaction.editReply("Você não está casado para poder se divorciar.");
            return;
        }

        const partnerId = your.married_to;
        const partner = await User.findOne({ guildId: interaction.guild?.id, userId: partnerId });

        if (partner) {
            your.married = false;
            your.married_to = "";
            await your.save();

            partner.married = false;
            partner.married_to = "";
            await partner.save();

            const embed = new EmbedBuilder({
                title: "Divórcio",
                description: `Você e seu parceiro(a) se divorciaram.`,
                color: Colors.Blue,
                author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ forceStatic: true }) },
                thumbnail: { url: interaction.user.displayAvatarURL({ forceStatic: true }) as string },
                footer: { text: `Que ambos encontrem a felicidade novamente.` },
                timestamp: new Date()
            });

            await interaction.editReply({ embeds: [embed] });
        }
    },
});
