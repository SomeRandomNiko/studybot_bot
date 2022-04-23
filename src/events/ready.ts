import { client } from "..";
import { Event } from "../structures/Events";
import config from "../shared/config";

export default new Event("ready", () => {
    console.log(`Client Logged in as ${client.user?.username}#${client.user?.discriminator}`);
    client.publishCommands(client.slashCommands, config.guildIds);
    client.user?.setPresence({ status: "idle", activities: [{ name: "Development", type: "PLAYING" }] });
});
