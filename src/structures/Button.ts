import { ButtonInteraction, ExcludeEnum, MessageButton } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export class Button extends MessageButton {
    constructor(public customId: string, label: string, style: ExcludeEnum<typeof MessageButtonStyles, "LINK">, ...mw: MiddlewareFunction[]) {
        super({ style: style || "PRIMARY", customId, label });
        this.use(...mw);
    }

    middlewares: MiddlewareFunction[] = [];

    use(...mw: MiddlewareFunction[]) {
        this.middlewares.push(...mw);
    }

    dispatch(interaction: ButtonInteraction) {
        return invokeMiddlewares(interaction, this.middlewares);
    }
}
