import { ApplicationCommandDataResolvable, Interaction, Client, ClientEvents, Collection } from "discord.js";
import config from "../shared/config";
import glob from "glob";
import { promisify } from "util"
import { Event } from "./Events";
import { Command } from "./Command";
import { Button } from "./Button";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, Command> = new Collection();
    slashCommands: ApplicationCommandDataResolvable[] = [];
    buttons: Collection<string, Button> = new Collection();

    constructor() {
        super({ intents: ["DIRECT_MESSAGES", "GUILD_MESSAGES"] });
    }

    async start() {
        await this.registerModules();
        await this.login(config.discordBotToken);
    }

    async registerModules() {
        // Commands
        const commandFiles = await globPromise(`${__dirname}/../commands/*{.ts,.js}`);

        commandFiles.forEach(async filePath => {
            const command: Command = await importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            this.slashCommands.push(command);
            console.log("Registered Command: ", command.name);
        });

        // Events
        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);

        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents> = await importFile(filePath);
            this.on(event.name, event.run);
            console.log("Registered Event: ", event.name);
        });

        // Buttons
        const buttonFiles = await globPromise(`${__dirname}/../buttons/*{.ts,.js}`);

        buttonFiles.forEach(async filePath => {
            const button: Button = await importFile(filePath);
            this.buttons.set(button.customId, button);
        });
    }

    async publishCommands(commands: ApplicationCommandDataResolvable[], guildIds?: string[]) {
        if (guildIds) {
            // Publish to one guild
            guildIds.forEach(id => {
                this.guilds.cache.get(id)?.commands.set(commands);
                console.log(`Registered Commands to Guild ${id}`);
            });
        } else {
            // Publish to all guilds
            this.application?.commands.set(commands);
            console.log(`Registered Commands Globally`);
        }
    }
}

async function importFile(filePath: string) {
    return (await import(filePath))?.default;
}