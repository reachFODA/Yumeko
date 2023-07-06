import { ExtendedClient } from "../ExtendedClient";
import { CommandInteraction, CommandInteractionOptionResolver, ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction, Collection, ApplicationCommandData} from "discord.js"

interface CommandProps {
    client: ExtendedClient,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
}

export type ComponentsButton = Collection<string, (interaction: ButtonInteraction) => any>
export type ComponentsSelect = Collection<string, (interaction: StringSelectMenuInteraction) => any>
export type ComponentsModal = Collection<string, (interaction: ModalSubmitInteraction) => any>

interface CommandComponents {
    buttons?: ComponentsButton;
    selects?: ComponentsSelect;
    modals?: ComponentsModal;
}
export type CommandType = ApplicationCommandData & CommandComponents & {
    execute(props: CommandProps): any
}

export class Command {
    constructor(options: CommandType){
        options.dmPermission = false;
        Object.assign(this, options);
    }
}