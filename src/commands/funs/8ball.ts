import { ApplicationCommandOptionType, ApplicationCommandType, Colors, EmbedBuilder } from "discord.js";
import { Command } from "../../structs/types/Commands";

export default new Command({
    name: '8ball',
    description: '[🎡 Diversão] Faça uma pergunta para a 8ball.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'pergunta',
            description: 'Selecione a pergunta.',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    async execute({ interaction, options }) {

        const fortunes = [
            "Sim.",
            "É certo.",
            "É decididamente assim.",
            "Sem dúvida.",
            "sim definitivamente.",
            "Você pode contar com ele.",
            "A meu ver, sim.",
            "Provavelmente.",
            "Perspectiva boa.",
            "Sinais apontam que sim.",
            "Responder nebuloso, tente novamente.",
            "Pergunte novamente mais tarde.",
            "Melhor não te dizer agora...",
            "Não é possível prever agora.",
            "Concentre-se e pergunte novamente.",
            "Não conte com isso.",
            "Minha resposta é não.",
            "Minhas fontes dizem não.",
            "As perspectivas não são tão boas...",
            "Muito duvidoso.",
          ];

          const reply = fortunes[Math.floor(Math.random() * fortunes.length)]
          
          const embed = new EmbedBuilder({
            title: '8BALL',
            color: Colors.Blue,
            fields: [
                {
                    name: 'Pergunta:',
                    value: `${options.getString('pergunta')}`
                },
                {
                    name: 'Resposta:',
                    value: `${reply}`
                }
            ]
          })

          await interaction.reply({
            embeds: [embed]
          })

    }
})