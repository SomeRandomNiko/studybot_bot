import { hyperlink } from "@discordjs/builders";
import { CommandInteraction, Interaction, MessageComponentInteraction } from "discord.js";
import { isDigregConnected } from "./ApiService";
import { ErrorEmbed } from "./Embed";

export type NextFunction = () => void | Promise<void>;
export type MiddlewareFunction<T extends RepliableInteraction> = (interaction: T, next: NextFunction) => any
export type RepliableInteraction = CommandInteraction | MessageComponentInteraction;

export async function invokeMiddlewares<T extends RepliableInteraction>(interaction: T, middlewares: MiddlewareFunction<T>[]): Promise<void> {
    if (!middlewares.length) return;

    const mw = middlewares[0];

    return mw(interaction, async () => {
        await invokeMiddlewares(interaction, middlewares.slice(1));
    });
}

export async function digregRequired(interaction: RepliableInteraction, next: NextFunction) {
    try {
        if (await isDigregConnected(interaction.user.id))
            return next();

        interaction.reply({ ephemeral: true, embeds: [new ErrorEmbed(`ℹ️ You have to connect your Digital Register account to use this function. You can do so ${hyperlink("here", "https://app.studybot.it")}.`)] });
    } catch (error) {
        interaction.reply({ ephemeral: true, embeds: [new ErrorEmbed("❌ API Error. Contact the developers if you encounter this error.")] });
    }
}