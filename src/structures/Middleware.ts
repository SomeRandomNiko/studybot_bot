import { ButtonInteraction } from "discord.js";
import { ExtendedInteraction } from "./Command";

export type NextFunction = () => void | Promise<void>;
export type MiddlewareFunction<T extends ButtonInteraction | ExtendedInteraction = ButtonInteraction | ExtendedInteraction> = (interaction: T, next?: NextFunction) => any

export async function invokeMiddlewares(interaction: ButtonInteraction | ExtendedInteraction, middlewares: MiddlewareFunction<ButtonInteraction | ExtendedInteraction>[]): Promise<void> {
    if (!middlewares.length) return;

    const mw = middlewares[0];

    return mw(interaction, async () => {
        await invokeMiddlewares(interaction, middlewares.slice(1));
    });
}