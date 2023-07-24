import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { DatabaseUtils } from "../../utils/DatabaseUtils";
import User from "../../schemas/userSchema";
import { FormatUtils } from "../../utils/FormatUtils";

export default new Command({
    name: 'rep',
    description: '[🧑 Social] Selecione um usuário para dar reputação para ele.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione algum usuário.',
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    async execute({ interaction }) {

        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser('usuário');

        if (user?.bot) return interaction.editReply("Você não pode dar reputação em bots.");
        if (user?.id === interaction.user.id) return interaction.editReply("Você não pode dar reputação em si mesmo.");

        DatabaseUtils.registerUser(interaction.guild?.id as string, user?.id as string)

        const member = await User.findOne({
            guildId: interaction.guild?.id,
            userId: interaction.user.id
        })

        const target = await User.findOne({
            guildId: interaction.guild?.id,
            userId: user?.id
        })

        if (!member || !target) return;


        if (member.repCooldown > Date.now()) {
            const cooldown = new Date(member.repCooldown);
            const timeLeft = cooldown.getTime() - Date.now();
            const time_format = FormatUtils.formatTime(timeLeft);
            return interaction.editReply(`Você tem que esperar \`${time_format.hours} horas, ${time_format.minutes} minutos e ${time_format.seconds} segundos\` antes de dar reputação novamente.`);
        }

        target.rep += 1;
        await target.save();

        member.repCooldown = Date.now() + (60 * 60 * 24 * 1000);
        await member.save();

        return interaction.editReply(`Você deu uma reputação para ${user?.username}. Agora, o(a) ${user?.username} tem \`${target.rep}\` ${target.rep as unknown as number !== 1 ? 'reputações' : 'reputação'}.`);
    }
})