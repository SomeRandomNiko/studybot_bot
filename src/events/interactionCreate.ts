import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Events";
import { ExtendedInteraction } from "../structures/Command"
import { ExtendedEmbed } from "../structures/Embed";
import { bold, inlineCode } from "@discordjs/builders";

export default new Event("interactionCreate", async (interaction) => {
    // Slash Command
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if (!command) return sendNotFoundMessage(interaction);

        command.dispatch(interaction as ExtendedInteraction);
    } else if (interaction.isButton()) {
        await interaction.deferReply();
        const button = client.buttons.get(interaction.customId);
        if (!button) return sendNotFoundMessage(interaction);
        button.dispatch(interaction);
    }
});

function sendNotFoundMessage(interaction: CommandInteraction | ButtonInteraction) {
    const embed = new ExtendedEmbed("error", {
        title: "Command does not exist",
        description: interaction.isCommand() ? `The command ${bold(interaction.commandName)} was not found.
        For a list of available commands use ${inlineCode("/help")} or click the button below.` : `The Action for this button was not found.`,
    });

    const helpButton = new MessageButton().setLabel("Help").setStyle("PRIMARY").setCustomId("help");

    interaction.followUp({ embeds: [embed], components: [new MessageActionRow().addComponents(helpButton)] });
}