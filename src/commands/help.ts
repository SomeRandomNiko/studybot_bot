import { ButtonInteraction } from "discord.js";
import { Command, ExtendedInteraction } from "../structures/Command";

export default new Command({
    name: "help",
    description: "Displays a help message for commands",
    options: [
        { name: "command", type: "STRING", description: "The command to get help for" },
    ]
}, helpController);

export async function helpController(interaction: ExtendedInteraction | ButtonInteraction) {
    interaction.followUp("ok");
}