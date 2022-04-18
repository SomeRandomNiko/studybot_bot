import { MessageEmbed, MessageEmbedOptions } from "discord.js";

import { hyperlink } from "@discordjs/builders";

export class ExtendedEmbed extends MessageEmbed {

    constructor(messageType: "success" | "error" | "info", data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.messageType = messageType;
        this.setFooter({
            text: `https://studybot.it`,
        })
    }

    set messageType(type: "success" | "error" | "info") {
        this.setColor(type === "success" ? 0x3ba55d : type === "error" ? 0xed4245 : 0x5865f2);
    }
}