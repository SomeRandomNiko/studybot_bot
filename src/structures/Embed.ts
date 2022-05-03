import { EmbedField, MessageEmbed, MessageEmbedOptions, User } from "discord.js";

import { bold, hyperlink, italic, userMention } from "@discordjs/builders";
import config from "../shared/config";
import Fuse from "fuse.js";

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
    constructor(message?: string) {
        super({ color: 0xffffff, description: message });
    }
}

export class UserDataEmbed extends InfoEmbed {
    constructor(user: any) {
        super();
        this.setTitle("User");
        if (user.digreg) {
            this.setAuthor({ name: user.digreg.fullName, iconURL: user.discord.avatarUrl });
            this.addField("Class", user.digreg.className);
        } else {
            this.setAuthor({ name: user.discord.username, iconURL: user.discord.avatarUrl });
            this.setDescription(`${userMention(user.discord.id)} have not connected their ${italic("Digitales Register")} account yet. They can do so ${hyperlink("here", config.frontendServerUri)}.`);
        }
    }
}

export class TimerEmbed extends InfoEmbed {
    constructor(timer: any) {
        super();
        this.setTitle("Study Timer");
        this.setDescription("Your Study Timer. Use the Buttons or the Commands to control it.");
        this.addField("Study Time", timer.studyTime.toString(), true);
        this.addField("Break Time", timer.breakTime.toString(), true);
    }
}