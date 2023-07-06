import { Client, IntentsBitField, BitFieldResolvable, GatewayIntentsString, Partials, Collection, ApplicationCommandDataResolvable, ClientEvents } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { CommandType, ComponentsButton, ComponentsModal, ComponentsSelect } from "./types/Commands";
import { EventType } from "./types/Event";
import mongoose from "mongoose";
dotenv.config();

const fileCondition = (fileName: String) => fileName.endsWith(".ts") || fileName.endsWith(".js");

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    public buttons: ComponentsButton = new Collection();
    public selects: ComponentsSelect = new Collection();
    public modals: ComponentsModal = new Collection();
    constructor() {
        super({
            intents: Object.keys(IntentsBitField.Flags) as BitFieldResolvable<GatewayIntentsString, number>,
            partials: [
                Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent,
                Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User
            ]
        })
    }

    public start() {
        this.registerModules();
        this.registerEvents();
        this.registerDatabase();
        this.login(process.env.TOKEN)
    }
    private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
        this.application?.commands.set(commands)
            .then(() => {
                console.log("Slash commands (/) updated".green)
            })
            .catch(error => {
                console.log(`An error occured white tring to set the Slash commands (/): \n${error}`.red)
            })
    }
    private registerModules() {
        const slashCommands: Array<ApplicationCommandDataResolvable> = new Array();

        const commandsPath = path.join(__dirname, "..", "commands")

        fs.readdirSync(commandsPath).forEach(local => {
            fs.readdirSync(commandsPath + `/${local}/`).filter(fileCondition).forEach(async fileName => {
                const command: CommandType = (await import(`../commands/${local}/${fileName}`))?.default;
                const { name, buttons, selects, modals } = command

                if (name) {
                    this.commands.set(name, command);
                    slashCommands.push(command);

                    if (buttons) buttons.forEach((execute, key) => this.buttons.set(key, execute))
                    if (selects) selects.forEach((execute, key) => this.selects.set(key, execute))
                    if (modals) modals.forEach((execute, key) => this.modals.set(key, execute))
                }
            })
        })

        this.on("ready", () => this.registerCommands(slashCommands));
    }

    private registerEvents() {
        const eventsPath = path.join(__dirname, "..", "events");


        fs.readdirSync(eventsPath).forEach(local => {

            fs.readdirSync(`${eventsPath}/${local}`).filter(fileCondition)
                .forEach(async fileName => {
                    const { name, once, execute }: EventType<keyof ClientEvents> = (await import(`../events/${local}/${fileName}`))?.default

                    try {
                        if (name) (once) ? this.once(name, execute) : this.on(name, execute);
                    } catch (error) {
                        console.log(`An error occurred on event: ${name} \n${error}`.red);
                    }
                })

        })
    }

    private registerDatabase() {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) return console.log(`🍃 Mongo URI not found`.yellow);
        mongoose
          .connect(MONGO_URI)
          .then(() => console.log(`🍃 MongoDB connection has been established.`.green))
          .catch(() => console.log(`🍃 MongoDB connection has failed.`.red));
        
    }
}