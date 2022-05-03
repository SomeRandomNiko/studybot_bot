import { ApplicationCommandOptionChoice, ApplicationCommandOptionData, AutocompleteInteraction, CacheType, ChatInputApplicationCommandData, CommandInteraction, GuildMember, Interaction } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export interface CommandOptionsData extends ChatInputApplicationCommandData {
    autocomplete?: (interaction: AutocompleteInteraction) => ApplicationCommandOptionChoice[],
}

export class Command implements CommandOptionsData {

    middlewares: MiddlewareFunction<CommandInteraction>[];
    

    constructor(commandOptions: CommandOptionsData, ...mw: MiddlewareFunction<CommandInteraction>[]) {
        this.description = commandOptions.description;
        this.name = commandOptions.name;
        this.type = commandOptions.type;
        this.options = commandOptions.options;
        this.defaultPermission = commandOptions.defaultPermission;
        this.middlewares = [];
        this.autocomplete = commandOptions.autocomplete;
        this.use(...mw);
    }

    autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => ApplicationCommandOptionChoice[];
    description: string;
    type?: "CHAT_INPUT" | ApplicationCommandTypes.CHAT_INPUT | undefined;
    options?: ApplicationCommandOptionData[] | undefined;
    name: string;
    defaultPermission?: boolean | undefined;

    use(...mw: MiddlewareFunction<CommandInteraction>[]) {
        this.middlewares.push(...mw);
    }

    dispatch(interaction: CommandInteraction) {
        return invokeMiddlewares(interaction, this.middlewares);
    }
}