import { Interaction, MessageActionRow, MessageButton } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Events";
import { ErrorEmbed } from "../structures/Embed";
import { bold, inlineCode } from "@discordjs/builders";

export default new Event("interactionCreate", async (interaction) => {
    // Slash Command
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return sendNotFoundMessage(interaction);

        command.dispatch(interaction);
    } else if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (!button) return sendNotFoundMessage(interaction);
        button.dispatch(interaction);
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.respond([]);
        interaction.respond(command.autocomplete?.(interaction) || []);
    }
});

function sendNotFoundMessage(interaction: Interaction) {

    let embed;
    if (interaction.isCommand()) {
        embed = new ErrorEmbed(`The command ${bold(interaction.commandName)} was not found. For a list of available commands use ${inlineCode("/help")} or click the button below.`);
    } else {
        embed = new ErrorEmbed(`No Action for this Interaction was not found.`);
    }

    const helpButton = new MessageButton().setLabel("Help").setStyle("PRIMARY").setCustomId("help");

    if (interaction.isCommand() || interaction.isMessageComponent()) {
        interaction.reply({ embeds: [embed], components: [new MessageActionRow().setComponents(helpButton)] });
    }
}