import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType, ColorResolvable, Colors, EmbedBuilder, MessageCollector, PermissionFlagsBits, TextBasedChannel, } from "discord.js";
import { Command } from "../../structs/types/Commands";
import { FormatUtils } from "../../utils/FormatUtils";
import { DatabaseUtils } from "../../utils/DatabaseUtils";
import { PageUtils } from "../../utils/PageUtils";
import Family from "../../schemas/familySchema";
import User from "../../schemas/userSchema";
import Guild from "../../schemas/guildSchema";

const pendings: { [key: string]: string } = {};

export default new Command({
    name: 'familia',
    description: '[🧑 Social] Crie a sua família.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'criar',
            description: '[🧑 Social] Criar a sua família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'nome',
                    description: 'Selecione o nome.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'excluir',
            description: '[🧑 Social] Excluir a sua família',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'depositar',
            description: '[🧑 Social] Depositar dinheiro no banco da família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'quantidade',
                    description: 'Quantidade de dinheiro a ser depositada ou "tudo" para depositar tudo',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'retirar',
            description: '[🧑 Social] Retirar dinheiro no banco da família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'quantidade',
                    description: 'Quantidade de dinheiro a ser depositada ou "tudo" para depositar tudo',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'info',
            description: '[🧑 Social] Ver a informação da família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'tag',
                    description: 'Digite a tag do família para ver a informação dela',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'convidar',
            description: '[🧑 Social] Convidar para família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'usuário',
                    description: 'Selecione o usuário.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'expulsar',
            description: '[🧑 Social] Expulsar da família',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'usuário',
                    description: 'Selecione o usuário.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'sair',
            description: '[🧑 Social] Sair da família',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'lista',
            description: '[🧑 Social] Lista das famílias.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'transferir',
            description: '[🧑 Social] Transferir para outro usuário.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'usuário',
                    description: 'Selecione o usuário.',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'aliança',
            description: '[🧑 Social] Faça aliança com outra família.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'opção',
                    description: 'Selecione a opção.',
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        {
                            name: "Adicionar",
                            value: "adicionar"
                        },
                        {
                            name: "Remover",
                            value: "remover"
                        }
                    ],
                    required: true
                },
                {
                    name: 'tag',
                    description: 'Selecione a tag da família.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'upgrade',
            description: '[🧑 Social] Faça upgrade na sua família.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'cargo',
            description: '[🧑 Social] Crie o cargo da fámilia.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'cor',
                    description: 'Selecione uma cor.',
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
        {
            name: 'icone',
            description: '[🧑 Social] Mude a imagem do seu icone.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'imagem',
                    description: 'Coloque o link aqui!.',
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
    ],
    async execute({ interaction, options, client }) {
        const subCommand = options.getSubcommand();

        switch (subCommand) {
            case "criar":
                {
                    await interaction.deferReply({ ephemeral: false });

                    const familyName = options.getString("nome");
                    if (familyName !== null) {
                        const familyTag = familyName?.toLowerCase().replace(/ /g, "-");
                        const familyIcon = "https://media.discordapp.net/attachments/1128006454712995921/1133465929871785984/images.png";

                        const existingFamily = await Family.findOne({
                            guildId: interaction.guild?.id,
                            familyOwner: interaction.user.id
                        });

                        const member = await User.findOne({
                            guildId: interaction.guild?.id,
                            userId: interaction.user.id
                        })

                        if (existingFamily) {
                            return interaction.editReply("Você já tem uma família.");
                        }

                        const inFamily = await Family.findOne({
                            guildId: interaction.guild?.id,
                            familyMembers: interaction.user.id,
                        });

                        if (inFamily) {
                            return interaction.editReply("Você já está em uma família.");
                        }

                        const aFamily = await Family.findOne({
                            guildId: interaction.guild?.id,
                            familyName: familyName,
                        });

                        if (aFamily) {
                            return interaction.editReply("Esse nome de família já está sendo usado.");
                        }

                        const aFamilyTag = await Family.findOne({
                            guildId: interaction.guild?.id,
                            familyTag: familyTag,
                        });

                        if (aFamilyTag) {
                            return interaction.editReply("Essa tag de família já está sendo usada.");
                        }

                        if (familyName.length > 20) {
                            return interaction.editReply(`Por favor, coloque o nome da sua família com no máximo 20 caracteres.`);
                        }

                        if (member?.money as number < 5000) {
                            return interaction.editReply(`Você precisa de R$${FormatUtils.FormatNumber(5000)} para criar uma fámilia.`)
                        }

                        if (member) {
                            member.money -= 5000;
                            await member.save()
                        }


                        const newFamily = new Family({
                            guildId: interaction.guild?.id,
                            familyName: familyName,
                            familyLevel: 1,
                            familyTag: familyTag,
                            familyDescription: "Sem descrição",
                            familyIcon: familyIcon,
                            familyBanner: "https://cdn.discordapp.com/attachments/1128006454712995921/1133465929871785984/images.png",
                            familyOwner: interaction.user.id,
                            familyCreatedAt: Date.now(),
                            familyMembers: [interaction.user.id],
                            familyAlliance: [],
                            familyChat: "",
                            familyRole: "",
                            familyMoney: 0,
                            memberLimit: 10,
                            categoryChat: "",
                        });

                        await newFamily.save().then(() => {
                            const embed = new EmbedBuilder({
                                color: Colors.Blue,
                                title: 'Nova família criada',
                                description: `A família \`${familyName}\` foi criada`,
                                thumbnail: { url: familyIcon },
                                footer: { text: `Tag da família: ${familyTag}` }
                            });

                            return interaction.editReply({
                                embeds: [embed],
                            });
                        });
                    }
                }
                break;
            case "excluir":
                {
                    await interaction.deferReply({ ephemeral: false });


                    const family = await Family.findOne({
                        guildId: interaction.guild?.id,
                        familyOwner: interaction.user.id,
                    });

                    if (!family) {
                        return interaction.editReply("Você não é dono de uma família ou não possui uma família.");
                    }

                    await family.deleteOne().then(() => {
                        const embed = new EmbedBuilder({
                            color: Colors.Blue,
                            title: 'Família deletada',
                            description: `\`${interaction.user.username}\` *A família foi deletada*`,
                            thumbnail: { url: family.familyIcon as string },
                            footer: { text: `Tag da família: ${family.familyTag}` }
                        });

                        return interaction.editReply({ embeds: [embed] });
                    });
                }
                break;
            case "depositar": {
                await interaction.deferReply({ ephemeral: true });

                const amount = options.getString("quantidade");

                const filters = ["+", "-"];
                for (const message of filters) {
                    if (amount?.includes(message)) return interaction.editReply('Você não pode fazer isso!');
                }

                if (!amount || (amount !== "tudo" && isNaN(parseFloat(amount)))) {
                    return interaction.editReply('Selecione uma quantidade válida ou use "tudo".');
                }

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!family) {
                    return interaction.editReply("Você não é o dono da família.");
                }

                const member = await User.findOne({
                    userId: interaction.user.id,
                    guildId: interaction.guild?.id
                });

                if (!member || typeof member.money === 'undefined') {
                    return interaction.editReply("Erro ao obter informações da conta.");
                }

                if (amount === null) {
                    return interaction.editReply("Quantidade inválida ou ausente.");
                }

                const depositAmount = amount === "tudo" ? member.money : parseInt(amount);

                if (depositAmount > member.money) {
                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: 'Erro de depósito',
                        author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                        description: `Você não tem dinheiro suficiente para depositar este valor.`,
                        timestamp: new Date(),
                    });

                    return interaction.editReply({ embeds: [embed] });
                }

                member.money -= depositAmount;
                await member.save();

                if (typeof family.familyMoney === "number") {
                    family.familyMoney += depositAmount;
                    await family.save();
                } else {
                    return interaction.editReply("Erro ao depositar o dinheiro na família.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: 'Depósito realizado',
                    author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                    description: `Você depositou \`R$${FormatUtils.FormatNumber(depositAmount)}\` no banco da família.`,
                    timestamp: new Date(),
                });

                return interaction.editReply({ embeds: [embed] });
            }
                break;
            case "retirar": {
                await interaction.deferReply({ ephemeral: true });

                const amount = options.getString("quantidade");

                const filters = ["+", "-"];
                for (const message of filters) {
                    if (amount?.includes(message)) return interaction.editReply('Você não pode fazer isso!');
                }

                if (isNaN(parseFloat(amount ?? '')) && amount !== 'tudo') {
                    return interaction.editReply('Selecione uma quantidade ou use "tudo".');
                }

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!family) {
                    return interaction.editReply("Você não é o dono da família.");
                }

                const member = await User.findOne({
                    userId: interaction.user.id,
                    guildId: interaction.guild?.id,
                });

                if (!member || typeof member.money === 'undefined') {
                    return interaction.editReply("Erro ao obter informações da conta.");
                }

                if (amount === null) {
                    return interaction.editReply("Quantidade inválida ou ausente.");
                }

                // Initialize familyMoney with 0 if it's not defined
                if (typeof family.familyMoney === 'undefined') {
                    family.familyMoney = 0;
                }

                if (amount === "tudo") {
                    const withdrawAmount = family?.familyMoney as number;
                    if (withdrawAmount === 0) {
                        return interaction.editReply("Não há dinheiro suficiente no banco da família para retirar.");
                    }

                    if (family) {
                        family.familyMoney = 0;
                        await family.save();
                    }

                    if (typeof member.money === "number") {
                        member.money += withdrawAmount;
                        await member.save();
                    } else {
                        return interaction.editReply("Erro ao retirar o dinheiro da família.");
                    }

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: 'Retirada realizada',
                        author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                        description: `Você retirou \`R$${FormatUtils.FormatNumber(withdrawAmount)}\` do banco da família.`,
                        timestamp: new Date(),
                    });

                    return interaction.editReply({ embeds: [embed] });
                } else {
                    const withdrawAmount = parseInt(amount);

                    if (withdrawAmount > family?.familyMoney) {
                        const embed = new EmbedBuilder({
                            color: Colors.Blue,
                            title: 'Erro de retirada',
                            author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                            description: `Não há dinheiro suficiente no banco da família para retirar este valor.`,
                            timestamp: new Date(),
                        });

                        return interaction.editReply({ embeds: [embed] });
                    }

                    if (family) {
                        family.familyMoney -= withdrawAmount;
                        await family.save();
                    }

                    if (typeof member.money === "number") {
                        member.money += withdrawAmount;
                        await member.save();
                    } else {
                        return interaction.editReply("Erro ao retirar o dinheiro da família.");
                    }

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: 'Retirada realizada',
                        author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL({ forceStatic: true }) as string },
                        description: `Você retirou \`R$${FormatUtils.FormatNumber(withdrawAmount)}\` do banco da família.`,
                        timestamp: new Date(),
                    });

                    return interaction.editReply({ embeds: [embed] });
                }
            }
                break;
            case "info": {
                await interaction.deferReply({ ephemeral: false });

                const familyTag = options.getString("tag");

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyTag: familyTag,
                });

                if (!family) {
                    return interaction.editReply("Essa família não foi encontrada.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: `:family: Família ${family.familyName}`,
                    author: {
                        name: `Dono: ${client.users.cache.get(family.familyOwner as string)?.username || "Desconhecido"}`,
                        iconURL: interaction.guild?.iconURL({ forceStatic: true }) || undefined,
                    },
                    description: `:money_with_wings: Utilize \`/familia depositar\` e \`/familia retirar\` para gerenciar o dinheiro da família.`,
                    fields: [
                        { name: "Nome:", value: `\`${family.familyName}\``, inline: true },
                        { name: "Level:", value: `\`${family.familyLevel}\``, inline: true },
                        { name: "Tag:", value: `\`${family.familyTag}\``, inline: true },
                        { name: "Descrição:", value: `\`${family.familyDescription || "Sem descrição"}\``, inline: true },
                        { name: "Membros:", value: `\`🧑‍🤝‍🧑 ${family.familyMembers?.length || 0}/${family.memberLimit}\``, inline: true },
                        { name: "Alianças:", value: `\`🤝 ${family.familyAlliance?.length || 0}/5\``, inline: true },
                        { name: "Dinheiro:", value: `\`💰 R$${FormatUtils.FormatNumber(family.familyMoney || 0)}\``, inline: true }
                    ],
                    thumbnail: { url: family.familyIcon as string },
                    timestamp: new Date(),
                    footer: { text: `Tag: ${family.familyTag}` }
                });

                return interaction.editReply({ embeds: [embed] });
            }
                break;
            case 'convidar': {
                await interaction.deferReply({ ephemeral: false });

                const user = interaction.options.getUser("usuário");
                if (!user || user.id === interaction.user.id) {
                    return interaction.editReply("Você não pode convidar a si mesmo.");
                }
                if (user.bot) {
                    return interaction.editReply("Você não pode convidar bots.");
                }

                for (const requester in pendings) {
                    const receiver = pendings[requester];
                    if (requester === interaction.user.id) {
                        return interaction.editReply("Você já tem um convite de perdente");
                    } else if (receiver === interaction.user.id) {
                        return interaction.editReply("Você já tem um convite de recebimento");
                    } else if (requester === user.id) {
                        return interaction.editReply("Este usuário já tem um convite pendente");
                    } else if (receiver === user.id) {
                        return interaction.editReply("Este usuário já recebeu um convite");
                    }
                }

                DatabaseUtils.registerUser(interaction.guild?.id as string, user.id as string);

                const existingFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!existingFamily) {
                    return interaction.editReply("Você não é dono de uma família ou não possui uma família.");
                }

                const inFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyMembers: user.id,
                });

                if (inFamily) {
                    return interaction.editReply("Esse usuário já está em uma família.");
                }

                if (!Array.isArray(existingFamily.familyMembers)) {
                    return interaction.editReply("Erro ao obter informações da família.");
                }

                if (existingFamily.familyMembers.includes(user.id)) {
                    return interaction.editReply("Esse usuário já faz parte da sua família.");
                }

                if (typeof existingFamily.memberLimit !== "number") {
                    return interaction.editReply("Erro ao obter o limite de membros da família.");
                }

                if (existingFamily.familyMembers.length >= existingFamily.memberLimit) {
                    return interaction.editReply("Sua família está cheia. Você não pode convidar mais membros.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Convite para a Família",
                    description: `Você recebeu um convite para entrar na família \`${existingFamily.familyName}\` do usuário \`${interaction.user.username}\`.`,
                    footer: { text: "Você tem 30 segundos para aceitar ou recusar o convite. Digite `\"aceitar`\" ou `\"recusar``\"." }
                });

                await interaction.editReply({ embeds: [embed] });

                const filter = (m: { author: { id: string | undefined; }; content: string; }) => m.author.id === user?.id && (m.content.toLowerCase() === "aceitar" || m.content.toLowerCase() === "recusar");
                const collector = new MessageCollector(interaction.channel as TextBasedChannel, { filter: filter, time: 30000 });

                collector.on("collect", async (message) => {
                    const content = message.content.toLowerCase();
                    if (content === "aceitar") {


                        if (!Array.isArray(existingFamily.familyMembers)) {
                            existingFamily.familyMembers = [];
                        }


                        existingFamily.familyMembers.push(user.id);
                        await existingFamily.save();

                        const acceptEmbed = new EmbedBuilder({
                            color: Colors.Blue,
                            title: "Convite de Família",
                            description: `\`${user.username}\` *Aceitou o convite para entrar na família.*`,
                            thumbnail: { url: existingFamily.familyIcon as string },
                            footer: { text: `Nome da família: ${existingFamily.familyName}` }
                        });

                        delete pendings[interaction.user.id];
                        await message.reply({ embeds: [acceptEmbed] });

                        if (existingFamily.familyRole) {
                            for (const member of existingFamily.familyMembers) {
                                const guildMember = interaction.guild?.members.cache.get(member);
                                if (guildMember) {
                                    try {
                                        await guildMember.roles.add(existingFamily.familyRole);
                                    } catch (error) {
                                        console.error(`Error adding role to member ${member}:`, error);
                                    }
                                }
                            }
                        }
                    } else if (content === "recusar") {
                        const declineEmbed = new EmbedBuilder({
                            color: Colors.Blue,
                            title: "Convite de Família",
                            description: `\`${user.tag}\` *Recusou o convite para entrar na família.*`,
                            thumbnail: { url: existingFamily.familyIcon as string },
                            footer: { text: `Nome da família: ${existingFamily.familyName}` }
                        });

                        delete pendings[interaction.user.id];
                        await message.reply({ embeds: [declineEmbed] });
                    }

                    collector.stop();
                });

                collector.on("end", async (collected, reason) => {
                    if (reason === "time") {
                        // Deletar pedido da família
                        delete pendings[interaction.user.id];
                        const timeoutEmbed = new EmbedBuilder({
                            color: Colors.Blue,
                            title: "Convite de Família",
                            description: "Sem respostas.",
                        });

                        await interaction.editReply({ content: "Sem respostas.", embeds: [timeoutEmbed] });
                        collector.stop();
                    }
                });
            }
                break;
            case 'expulsar': {
                await interaction.deferReply({ ephemeral: false });

                const user = interaction.options.getUser("usuário");
                if (!user) {
                    return interaction.editReply("Usuário inválido ou não encontrado.");
                }

                const existingFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!existingFamily) {
                    return interaction.editReply("Você não é dono de uma família ou não possui uma família.");
                }

                if (!Array.isArray(existingFamily.familyMembers) || !existingFamily.familyMembers.includes(user.id)) {
                    return interaction.editReply("O usuário não faz parte da sua família.");
                }

                if (user.id === interaction.user.id) {
                    return interaction.editReply("Você não pode expulsar a si mesmo.");
                }

                existingFamily.familyMembers = existingFamily.familyMembers.filter(member => member !== user.id);

                try {
                    await existingFamily.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Expulsão da Família",
                    description: `\`${user.username}\` *foi expulso da família.*`,
                    thumbnail: { url: existingFamily.familyIcon as string },
                    footer: { text: `Nome da família: ${existingFamily.familyName}` }
                });

                await interaction.editReply({ embeds: [embed] });

                const guildMember = interaction.guild?.members.cache.get(user.id);
                if (guildMember && existingFamily.familyRole) {
                    try {
                        await guildMember.roles.remove(existingFamily.familyRole);
                    } catch (error) {
                        console.error(`Error removing role from member ${user.id}:`, error);
                    }
                }
            }
                break;
            case 'sair': {
                await interaction.deferReply({ ephemeral: false });

                const existingFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyMembers: interaction.user.id,
                });

                if (!existingFamily) {
                    return interaction.editReply("Você não faz parte de uma família.");
                }

                if (!Array.isArray(existingFamily.familyMembers)) {
                    return interaction.editReply("Erro ao obter informações da família.");
                }

                const owner = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (owner) return interaction.editReply("Você não pode sair do clã, você é dono.");

                existingFamily.familyMembers = existingFamily.familyMembers.filter(member => member !== interaction.user.id);

                try {
                    await existingFamily.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Saída da Família",
                    description: `\`${interaction.user.username}\` *saiu da família.*`,
                    thumbnail: { url: existingFamily.familyIcon as string },
                    footer: { text: `Nome da família: ${existingFamily.familyName}` }
                });

                await interaction.editReply({ embeds: [embed] });

                const guildMember = interaction.guild?.members.cache.get(interaction.user.id);
                if (guildMember && existingFamily.familyRole) {
                    try {
                        await guildMember.roles.remove(existingFamily.familyRole);
                    } catch (error) {
                        console.error(`Error removing role from member ${interaction.user.id}:`, error);
                    }
                }
            }
                break;
            case 'lista': {

                const allFamilies = await Family.find({
                    guildId: interaction.guild?.id
                });

                if (allFamilies.length === 0) {
                    return interaction.editReply("Não há famílias disponíveis.");
                }

                const itemsPerPage = 5;
                const pageCount = Math.ceil(allFamilies.length / itemsPerPage);
                const pages: EmbedBuilder[] = [];

                for (let page = 0; page < pageCount; page++) {
                    const startIndex = page * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const familiesOnPage = allFamilies.slice(startIndex, endIndex);

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: "Lista de Famílias",
                        footer: { text: `Página ${page + 1}/${pageCount}` },
                    });

                    for (const family of familiesOnPage) {
                        embed.setDescription(`\`${family.familyName} (LvL.${family.familyLevel})\``)
                    }

                    pages.push(embed);
                }

                await PageUtils.setPage(interaction, pages, pageCount);
            }
                break;
            case 'transferir': {

                await interaction.deferReply({ ephemeral: false });

                const user = interaction.options.getUser("usuário");

                const existingFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!existingFamily) {
                    return interaction.editReply("Você não é dono de uma família ou não possui uma família.");
                }

                if (user?.id === interaction.user.id) {
                    return interaction.editReply("Você não pode transferir a família para si mesmo.");
                }

                if (user?.bot) {
                    return interaction.editReply("Você não pode transferir a família para um bot.");
                }

                const existingOwnerFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: user?.id,
                });

                if (existingOwnerFamily) {
                    return interaction.editReply("O usuário de destino já é dono de outra família.");
                }

                existingFamily.familyOwner = user?.id;

                try {
                    await existingFamily.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Transferência de Família",
                    description: `A família foi transferida para o usuário \`${user?.username}\`.`,
                    thumbnail: { url: existingFamily.familyIcon as string },
                    footer: { text: `Nome da família: ${existingFamily.familyName}` }
                });

                await interaction.editReply({ embeds: [embed] });
            }
                break;
            case "aliança": {

                await interaction.deferReply({ ephemeral: false });

                const familyName = options.getString("tag");

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyName: familyName,
                });

                if (!family || family.familyOwner !== interaction.user.id) {
                    return interaction.editReply("Essa família não foi encontrada ou você não é o dono da família.");
                }

                const currentFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!currentFamily) {
                    return interaction.editReply("Você não possui uma família.");
                }

                if (!currentFamily?.familyAlliance) {
                    currentFamily.familyAlliance = [];
                }

                const option = options.getString("opção");
                if (option === "adicionar") {
                    if (family.familyOwner === interaction.user.id) {
                        return interaction.editReply(
                            "Você não pode adicionar sua própria família à sua aliança."
                        );
                    }

                    if (currentFamily.familyAlliance.length >= 5) {
                        return interaction.editReply("Sua aliança de famílias está cheia.");
                    }

                    if (currentFamily.familyAlliance.includes(family.familyName as string)) {
                        return interaction.editReply("Esta família já está em sua aliança.");
                    }

                    currentFamily.familyAlliance.push(family.familyName as string);

                    try {
                        await currentFamily.save();
                    } catch (error) {
                        console.error("Error saving family:", error);
                        return interaction.editReply(
                            "Ocorreu um erro ao salvar as informações da família."
                        );
                    }

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: "Aliança de Famílias",
                        description: `\`${family.familyName}\` *Foi adicionado na aliança.*`,
                        thumbnail: { url: family.familyIcon as string },
                        footer: { text: `Dono da família: ${client.users.cache.get(family.familyOwner as string)?.username}` }
                    });

                    return interaction.editReply({ embeds: [embed] });
                } else if (option === "remover") {
                    if (family.familyOwner === interaction.user.id) {
                        return interaction.editReply("Você não pode remover sua própria família da aliança.");
                    }

                    if (!currentFamily.familyAlliance.includes(family.familyName as string)) {
                        return interaction.editReply("Esta família não está em sua aliança.");
                    }

                    currentFamily.familyAlliance = currentFamily.familyAlliance.filter(name => name !== family.familyName);

                    try {
                        await currentFamily.save();
                    } catch (error) {
                        console.error("Error saving family:", error);
                        return interaction.editReply(
                            "Ocorreu um erro ao salvar as informações da família."
                        );
                    }

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: "Aliança de Famílias",
                        description: `\`${family.familyName}\` *Você removeu essa família da aliança.*`,
                        thumbnail: { url: family.familyIcon as string },
                        footer: { text: `Dono da família: ${client.users.cache.get(family.familyOwner as string)?.username}` }
                    });

                    return interaction.editReply({ embeds: [embed] });
                } else {
                    return interaction.editReply("Opção inválida. Use `adicionar` ou `remover`.");
                }
            }
                break;
            case "chat": {
                await interaction.deferReply({ ephemeral: true });

                const existingFamily = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                const guild = await Guild.findOne({
                    guildId: interaction.guild?.id
                })

                const role = await Family.findOne({
                    guild_id: interaction.guild?.id,
                    clan_role: { $in: interaction.guild?.roles.cache.map((r) => r.id) },
                });

                if (!role) return interaction.editReply("Você precisar um cargo para comprar um chat");

                if (!existingFamily) {
                    return interaction.editReply("Você não é dono de uma família ou não possui uma família.");
                }

                const existingChatChannel = interaction.guild?.channels.cache.find(
                    (channel) => channel.name === `${existingFamily.familyTag}-chat`
                );

                if (existingChatChannel) {
                    return interaction.editReply(`Seu clã já possui um chat: ${existingChatChannel}`);
                }

                if (typeof existingFamily.familyMoney !== "number" || isNaN(existingFamily.familyMoney)) {
                    return interaction.editReply("Erro ao obter informações do dinheiro da família.");
                }

                if (existingFamily.familyMoney < 10000) {
                    return interaction.editReply(`Você precisa de \`R$${FormatUtils.FormatNumber(10000)}\` de dinheiro da família para comprar o chat.`);
                }

                existingFamily.familyMoney -= 10000;

                try {
                    await existingFamily.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                let category = guild?.familyCategory as string | null;

                if (!interaction.guild?.channels.cache.get(category as string)) {
                    category = null;
                }

                const c = await interaction.guild?.channels.create({
                    name: `${existingFamily.familyTag}-chat`,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.AddReactions,
                            ],
                        },
                    ],
                }).then(async channel => {
                    await channel.send(`Seja bem-vindo ao chat da família ${interaction.member}`);
                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: "Chat da Família",
                        description: `\`${interaction.user.tag}\` *comprou um chat da família.*`,
                        thumbnail: { url: existingFamily.familyIcon as string },
                        footer: { text: `Tag da família: ${existingFamily.familyTag}` }
                    });

                    return interaction.editReply({ embeds: [embed] });
                });
            }
                break;
            case "upgrade": {
                await interaction.deferReply({ ephemeral: true });

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!family) {
                    return interaction.editReply("Você não é dono de uma família.");
                }

                if (family.familyLevel === undefined || family.familyLevel === 30) {
                    return interaction.editReply("Sua família já está no nível máximo.");
                }

                if (family.familyMoney === undefined || family.familyMoney < 0) {
                    return interaction.editReply("Ocorreu um erro ao obter as informações da família.");
                }

                if (family.memberLimit === undefined) {
                    family.memberLimit = 0;
                }

                const upgradeCost = 100 * Math.pow(3, family.familyLevel as number);
                if (family.familyMoney as number < upgradeCost) {
                    return interaction.editReply(`Você precisa de \`$${FormatUtils.FormatNumber(upgradeCost)}\` para fazer o upgrade da sua família.`);
                }

                family.familyMoney -= upgradeCost;
                family.familyLevel++;
                family.memberLimit += 5;

                try {
                    await family.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Upgrade de Família",
                    description: `\`${interaction.user.username}\` *você fez o upgrade da família para o nível* \`${family.familyLevel}\``,
                    thumbnail: { url: family.familyIcon as string },
                    footer: { text: `Tag da família: ${family.familyTag}` }
                });

                return interaction.editReply({ embeds: [embed] });
            }
                break;
            case "cargo": {
                await interaction.deferReply({ ephemeral: true });

                const args = options.getString("cor") as string;
                if (!args.startsWith("#")) {
                    return interaction.editReply("Por favor, utilize uma cor válida em formato hexadecimal (começando com #).");
                }

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!family) {
                    return interaction.editReply("Você não é dono de uma família.");
                }

                const role = interaction.guild?.roles.cache.find((role) => role.name === `${family.familyName}`);
                if (role) {
                    return interaction.editReply("Você já tem um cargo exclusivo para a sua família.");
                }

                if (family.familyMoney === undefined || family.familyMoney < 0) {
                    return interaction.editReply("Ocorreu um erro ao obter as informações da família.");
                }

                if (family.familyMoney < 5000) {
                    return interaction.editReply(`Você precisa de \`R$${FormatUtils.FormatNumber(5000)}\` para comprar uma tag para a sua família.`);
                }

                if (family.familyLevel === undefined || family.familyLevel < 7) {
                    return interaction.editReply(`Sua família precisa ser level \`7\` para comprar um cargo.`);
                }

                family.familyMoney -= 5000;

                try {
                    await family.save();
                } catch (error) {
                    console.error("Error saving family:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                }

                await interaction.guild?.roles.create({
                    name: `${family.familyName}`,
                    color: args as ColorResolvable,
                    permissions: [PermissionFlagsBits.ViewChannel],
                    mentionable: true,
                }).then(async (role) => {
                    family.familyRole = role.id;
                    try {
                        await family.save();
                    } catch (error) {
                        console.error("Error saving family:", error);
                        return interaction.editReply("Ocorreu um erro ao salvar as informações da família.");
                    }

                    const members = family.familyMembers || [];
                    for (const memberId of members) {
                        const member = await interaction.guild?.members.fetch(memberId);
                        if (member) {
                            try {
                                await member.roles.add(role);
                            } catch (error) {
                                console.error(`Error adding role to member ${memberId}:`, error);
                            }
                        }
                    }

                    const embed = new EmbedBuilder({
                        color: Colors.Blue,
                        title: "Cargo da Família",
                        description: `\`${interaction.user.tag}\` *Você comprou um cargo para a sua família.*`,
                        thumbnail: { url: family.familyIcon as string },
                        footer: { text: `Tag da família: ${family.familyTag}` }
                    });

                    return interaction.editReply({ embeds: [embed] });
                });
            }
                break;
            case "icone": {
                await interaction.deferReply({ ephemeral: true });

                const args = options.getString("imagem") as string

                const family = await Family.findOne({
                    guildId: interaction.guild?.id,
                    familyOwner: interaction.user.id,
                });

                if (!family) {
                    return interaction.editReply("Você não é dono do clã.");
                }

                if (!args.startsWith("http")) {
                    return interaction.editReply("Por favor, coloque um link válido para a imagem.");
                }

                const ends = [".png", ".gif", ".jpg", ".jpeg", ".webp"];
                if (!ends.some((e) => args.endsWith(e))) {
                    return interaction.editReply(`Por favor, coloque uma imagem que termine com ${ends.join(", ")}.`);
                }

                family.familyIcon = args;
                try {
                    await family.save();
                } catch (error) {
                    console.error("Error saving clan:", error);
                    return interaction.editReply("Ocorreu um erro ao salvar as informações do clã.");
                }

                const embed = new EmbedBuilder({
                    color: Colors.Blue,
                    title: "Ícone do Família",
                    description: `\`${interaction.user.tag}\` *Você trocou o ícone do família.*`,
                    thumbnail: { url: family.familyIcon as string },
                    footer: { text: `Tag da família: ${family.familyTag}` }
                });

                return interaction.editReply({ embeds: [embed] });
            }
                break;

        }
    }
});
