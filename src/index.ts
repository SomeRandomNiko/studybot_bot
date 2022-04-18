import { Collection } from "discord.js";
import { ExtendedClient } from "./structures/Client";

export const client = new ExtendedClient();
export const studyTimers = new Collection<string, NodeJS.Timeout>();

process.stdin.resume(); //so the program will not close instantly

// Sets the bot to offline before exiting
function exitHandler() {
    console.log("Exiting")
    client.user?.setStatus("invisible");
    process.exit();
}

// Handling Exit events
process.on("SIGINT", exitHandler);


client.start();