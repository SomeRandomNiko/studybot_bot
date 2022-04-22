import { Interaction, ExcludeEnum, MessageButton, ButtonInteraction } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export class Button extends MessageButton {
    constructor(public customId: string, label: string, style: ExcludeEnum<typeof MessageButtonStyles, "LINK">, ...mw: MiddlewareFunction<ButtonInteraction>[]) {
        super({ style: style || "PRIMARY", customId, label });
        this.use(...mw);
    }

    middlewares: MiddlewareFunction<ButtonInteraction>[] = [];

    use(...mw: MiddlewareFunction<ButtonInteraction>[]) {
        this.middlewares.push(...mw);
    }

    dispatch(interaction: ButtonInteraction) {
        return invokeMiddlewares(interaction, this.middlewares);
    }
}
