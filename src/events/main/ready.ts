import { client } from "../..";
import PresenceManager from "../../extensions/PresenceManager";
import { Event } from "../../structs/types/Event";

export default new Event({
    name: "ready",
    once: true,
    async execute(){

        const { commands } = client
        const presenceManager = new PresenceManager(client);

        console.log(`Bot started in ${client.user?.username}`.green)
        console.log(`Loaded ${commands.size} commands`.cyan)
        presenceManager.setPresence();

    },
})