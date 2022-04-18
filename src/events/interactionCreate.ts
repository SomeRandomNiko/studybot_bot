import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Events";
import { ExtendedInteraction } from "../structures/Command"

export default new Event("interactionCreate", async (interaction) => {
    // Slash Command
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.followUp("Command does not exist");
        command.dispatch({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        });
    }
})