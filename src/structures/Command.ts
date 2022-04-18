import { ApplicationCommandOptionData, ChatInputApplicationCommandData, CommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export class Command implements ChatInputApplicationCommandData {

    middlewares: MiddlewareFunction[];

    constructor(commandOptions: ChatInputApplicationCommandData, ...mw: MiddlewareFunction[]) {
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

    use(...mw: MiddlewareFunction[]) {
        this.middlewares.push(...mw);
    }

    dispatch(interaction: ExtendedInteraction): Promise<void> {
        return invokeMiddlewares(interaction, this.middlewares);
    }
}

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember
}