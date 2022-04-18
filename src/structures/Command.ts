import { ApplicationCommandOptionData, ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { ExtendedClient } from "./Client";

export class Command implements ChatInputApplicationCommandData {

    middlewares: Middleware[];

    constructor(commandOptions: ChatInputApplicationCommandData, ...mw: Middleware[]) {
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

    use(...mw: Middleware[]) {
        this.middlewares.push(...mw);
    }

    dispatch(context: RunOptions): Promise<void> {
        return invokeMiddlewares(context, this.middlewares);
    }
}

async function invokeMiddlewares(context: RunOptions, middlewares: Middleware[]): Promise<void> {
    if (!middlewares.length) return;

    const mw = middlewares[0];

    return mw(context, async () => {
        await invokeMiddlewares(context, middlewares.slice(1));
    });
}

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember
}

export interface RunOptions {
    client: ExtendedClient,
    interaction: ExtendedInteraction,
    args: CommandInteractionOptionResolver,
}

export type Next = () => void | Promise<void>;
export type Middleware = (context: RunOptions, next: Next) => any;