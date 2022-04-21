import { MessageEmbed, MessageEmbedOptions } from "discord.js";

import { hyperlink, italic, userMention } from "@discordjs/builders";
import config from "../config";

export class ExtendedEmbed extends MessageEmbed {

    constructor(data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.setFooter({
            text: `https://studybot.it`,
        })
    }
}

export class ErrorEmbed extends ExtendedEmbed {
    constructor(errorMessage: string) {
        super({ color: 0xed4245, title: "ERROR", description: errorMessage });
    }
}

export class InfoEmbed extends ExtendedEmbed {
    constructor() {
        super({ color: 0xffffff });
    }
}

export class UserDataEmbed extends InfoEmbed {
    constructor(user: any) {
        super();
        if (user.digreg) {
            this.setAuthor({ name: user.digreg.fullName, iconURL: user.discord.avatarUrl });
            this.addField("Class", user.digreg.className);
        } else {
            this.setAuthor({ name: user.discord.username, iconURL: user.discord.avatarUrl });
            this.setDescription(`${userMention(user.discord.id)} have not connected their ${italic("Digitales Register")} account yet. They can do so ${hyperlink("here", config.frontendServerUri)}.`);
        }
    }
}