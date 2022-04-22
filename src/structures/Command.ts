import { ApplicationCommandAutocompleteOption, ApplicationCommandOptionData, AutocompleteInteraction, ChatInputApplicationCommandData, CommandInteraction, GuildMember, Interaction } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export class Command implements ChatInputApplicationCommandData {

    middlewares: MiddlewareFunction<CommandInteraction>[];

    constructor(commandOptions: ChatInputApplicationCommandData, ...mw: MiddlewareFunction<CommandInteraction>[]) {
        this.description = commandOptions.description;
        this.name = commandOptions.name;
        this.type = commandOptions.type;
        this.options = commandOptions.options;
        this.defaultPermission = commandOptions.defaultPermission;
        this.middlewares = [];
        this.use(...mw);
    }

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