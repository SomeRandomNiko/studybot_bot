import { Command } from "../structures/Command";
import { RepliableInteraction } from "../structures/Middleware";

export default new Command({
    name: "help",
    description: "Displays a help message for commands",
    options: [
        { name: "command", type: "STRING", description: "The command to get help for" },
    ]
}, helpController);

export async function helpController(interaction: RepliableInteraction) {
    interaction.reply("ok");
}