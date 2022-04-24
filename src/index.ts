import { Collection, Message } from "discord.js";
import { StudyTimeout } from "./commands/timer";
import { ExtendedClient } from "./structures/Client";

export const client = new ExtendedClient();
export const studyTimers = new Collection<string, StudyTimeout>();

process.stdin.resume(); //so the program will not close instantly

// Sets the bot to offline before exiting
function exitHandler(event: any) {
    console.log(`Exiting: ${event}`);
    client.user?.setStatus("invisible");
    process.exit();
}

// Handling Exit events
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, exitHandler);
})


client.start();