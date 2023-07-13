import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { Command } from "../../structs/types/Commands";

export default new Command({
    name: 'perfil',
    description: '[🧑 Social] Veja o perfil de um usuário',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            description: 'Selecione um usuário.',
            type: ApplicationCommandOptionType.User
        }
    ],
    async execute({ interaction, options }) {

        await interaction.deferReply({ ephemeral: false });

        const user = options.getUser('usuário');
        const mention = user ? user.id : interaction.user.id;
        const userName = user ? user.username : interaction.user.username;
        const avatarURL = user ? user.displayAvatarURL({ extension: "png", size: 512 }) : interaction.user.displayAvatarURL({ extension: "png", size: 512 });        

    }
})