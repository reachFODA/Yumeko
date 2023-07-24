import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder, MessageCollector, TextBasedChannel } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { DatabaseUtils } from "../../utils/DatabaseUtils";
import User from "../../schemas/userSchema";

const pendings: { [key: string]: string } = {};

export default new Command({
    name: 'casar',
    description: '[🧑 Social] Proponha casamento a outro usuário.',
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: 'usuário',
        description: 'Selecione o usuário',
        type: ApplicationCommandOptionType.User,
        required: true,
    }],
    async execute({ interaction }) {

        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser("usuário");
        if (user?.id === interaction.user.id) return interaction.editReply("Você não pode casar com si mesmo.");
        if (user?.bot) return interaction.editReply("Você não pode casar com bots.");

        DatabaseUtils.registerUser(interaction.guild?.id as string, user?.id as string)

        for(const requester in pendings) {
            const receiver = pendings[requester];
            if (requester === interaction.user.id) { 
                interaction.editReply("Você já tem um pedido de casamento enviado."); 
                return;
            } else if (receiver === interaction.user.id) {
                interaction.editReply("Você já recebeu um pedido de casamento."); 
                return;
            } else if (requester === user?.id) {
                interaction.editReply("Este usuário já tem um pedido de casamento pendente."); 
                return;
            } else if (receiver === user?.id) {
                interaction.editReply("Este usuário já recebeu pedido de casamento."); 
                return;
            }
        }

        const target = await User.findOne({ guildId: interaction.guild?.id, userId: user?.id });
        if (target?.married) {
            interaction.editReply("Esse usuário já está casado.");
            return;
        }

        const your = await User.findOne({ guildId: interaction.guild?.id, userId: interaction.user.id });
        if (your?.married) {
            interaction.editReply("Você já está casado.");
            return;
        }

        const embed = new EmbedBuilder({
            title: `Pedido de Casamento`,
            description: `${interaction.user} enviou um pedido de casamento para ${user}\nResponda: \`sim\` para aceitar ou \`não\` para recusar.`,
            color: Colors.Blue,
            author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ forceStatic: true }) },
            footer: { text: "Ele(a) tem 30 segundos para responder" },
            timestamp: new Date()
        });

        const Boxed = await interaction.editReply({ embeds: [embed] });

        pendings[interaction.user.id] = user?.id ?? "";

        const filter = (m: { author: { id: string | undefined; }; content: string; }) => m.author.id === user?.id && (m.content.toLowerCase() === "sim" || m.content.toLowerCase() === "não");
        const collector = new MessageCollector(interaction.channel as TextBasedChannel, { filter: filter, time: 30000 });

        collector.on('collect', async (message) => {
            const content = message.content.toLowerCase();
            if (content === 'sim') {
                if (target) {
                target.married = true;
                target.married_to = interaction.user.id;
                await target.save();
                }

                if (your) {
                your.married = true;
                your.married_to = user?.id as string;
                await your.save().then(async () => {
                    const embed = new EmbedBuilder({
                        title: "Pedido de Casamento Aceito",
                        description: `${user} aceitou o seu pedido de casamento`,
                        color: Colors.Blue,
                        author: { name: "Pedido de casamento aceito", iconURL: interaction.user.displayAvatarURL({ forceStatic: true }) },
                        thumbnail: { url: user?.displayAvatarURL({ forceStatic: true }) as string },
                        footer: { text: `${interaction.user.username} <3 ${user?.username}` },
                        timestamp: new Date()
                    });

                    delete pendings[interaction.user.id];
                    await message.reply({ embeds: [embed] });
                    return collector.stop();
                });
            }
            } else if (content === 'não') {
                const embed = new EmbedBuilder({
                    title: "Pedido de Casamento Recusado",
                    description: `${user} recusou o seu pedido, vai ter que chorar no banho`,
                    color: Colors.Blue,
                    author: { name: "Pedido de casamento recusado", iconURL: interaction.user.displayAvatarURL({ forceStatic: true }) },
                    thumbnail: { url: user?.displayAvatarURL({ forceStatic: true }) as string },
                    footer: { text: `Pedido por: ${interaction.user.tag}` },
                    timestamp: new Date()
                });

                delete pendings[interaction.user.id];
                await message.reply({ embeds: [embed] });
                return collector.stop();
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === "time") {
                delete pendings[interaction.user.id];
                await Boxed.edit({ content: "Casamento cancelado.", embeds: [] });
                return collector.stop();
            }
        });
    },
});