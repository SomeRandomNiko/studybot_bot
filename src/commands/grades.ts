import { Command, ExtendedInteraction } from "../structures/Command";
import { ButtonInteraction } from "discord.js";
import { getGrades, getUserData } from "../structures/ApiService";
import { AxiosError } from "axios";
import { ErrorEmbed, GradesDataEmbed, UserDataEmbed } from "../structures/Embed";
import { hyperlink, italic, userMention } from "@discordjs/builders";
import config from "../config";

export default new Command({
    name: "grades",
    description: "Displays a List of all your grades",
    options: [
        { name: "subject", description: "The Subject", type: "STRING", required: false }
    ],
}, gradesController);

function sendError(interaction: ExtendedInteraction, status?: number) {
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

    interaction.followUp({ embeds: [embed] });
}

async function gradesController(interaction: ExtendedInteraction | ButtonInteraction) {
    if (interaction.isCommand()) {
        const subjectSearch = interaction.options.getString("subject");

        try {
            const gradesData = await getGrades(interaction.user.id);
            interaction.followUp({ embeds: [new GradesDataEmbed(interaction.user, gradesData, subjectSearch?.toString())] })
        } catch (error) {
            console.log(error)
            const status = (error as AxiosError).response?.status;
            sendError(interaction, status);
        }
    }
}