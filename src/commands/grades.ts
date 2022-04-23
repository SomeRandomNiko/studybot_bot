import { Command } from "../structures/Command";
import { CommandInteraction, Interaction, MessageComponentInteraction } from "discord.js";
import { getGrades } from "../structures/ApiService";
import { AxiosError } from "axios";
import { ErrorEmbed, GradesDataEmbed } from "../structures/Embed";
import { hyperlink, italic } from "@discordjs/builders";
import config from "../shared/config";

export default new Command({
    name: "grades",
    description: "Displays a List of all your grades",
    options: [
        { name: "subject", description: "The Subject", type: "STRING", required: false }
    ],
}, gradesController);

function sendError(interaction: CommandInteraction | MessageComponentInteraction, status?: number) {
    let embed;
    switch (status) {
        case 401:
            embed = new ErrorEmbed("Not logged in. If you encounter this error, please contact the developers.");
            break;

        case 403:
            embed = new ErrorEmbed(`You have not connected your ${italic("Digitales Register")} account yet. You can do so ${hyperlink("here", config.frontendServerUri)}.`);
            break;

        default:
            embed = new ErrorEmbed(`If you encounter this error, please contact the developers.`);
            break;
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
}

async function gradesController(interaction: Interaction) {
    if (interaction.isCommand()) {
        const subjectSearch = interaction.options.getString("subject");

        try {
            const gradesData = await getGrades(interaction.user.id);
            interaction.reply({ embeds: [new GradesDataEmbed(interaction.user, gradesData, subjectSearch?.toString())], ephemeral: true })
        } catch (error) {
            console.log(error)
            const status = (error as AxiosError).response?.status;
            sendError(interaction, status);
        }
    }
}