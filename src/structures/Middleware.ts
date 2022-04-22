import { CommandInteraction, Interaction, MessageComponentInteraction } from "discord.js";

export type NextFunction = () => void | Promise<void>;
export type MiddlewareFunction<T extends RepliableInteraction> = (interaction: T, next?: NextFunction) => any
export type RepliableInteraction = CommandInteraction | MessageComponentInteraction;

export async function invokeMiddlewares<T extends RepliableInteraction>(interaction: T, middlewares: MiddlewareFunction<T>[]): Promise<void> {
    if (!middlewares.length) return;

    const mw = middlewares[0];

    return mw(interaction, async () => {
        await invokeMiddlewares(interaction, middlewares.slice(1));
    });
}