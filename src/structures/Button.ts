import { ButtonInteraction } from "discord.js";
import { invokeMiddlewares, MiddlewareFunction } from "./Middleware";

export class Button {
    constructor(public customId: string, ...mw: MiddlewareFunction[]) {
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
