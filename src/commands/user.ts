import { Command } from "../structures/Command";
import { Interaction } from "discord.js";
import { getUserData } from "../structures/ApiService";
import { AxiosError } from "axios";
import { ErrorEmbed, UserDataEmbed } from "../structures/Embed";
import { hyperlink } from "@discordjs/builders";
import config from "../shared/config";
import { RepliableInteraction } from "../structures/Middleware";


export default new Command({
    name: "user",
    description: "Displays user information",
    options: [{
        name: "user",
        description: "The user to display Information",
        type: "USER",
        required: false
    }],
}, userController);

async function userController(interaction: Interaction) {

    if (interaction.isCommand()) {
        const mentionedUserId = interaction.options.getUser("user")?.id || interaction.user.id;

        try {
            const userData = await getUserData(mentionedUserId);
            interaction.reply({embeds: [new UserDataEmbed(userData)], ephemeral: true});
        } catch (error) {
            const status = (error as AxiosError).response?.status;
            sendError(interaction, status);
        }
    }
}

function sendError(interaction: RepliableInteraction, status?: number) {
    let embed;
    switch (status) {
        case 401:
            embed = new ErrorEmbed("Not logged in. If you encounter this error, please contact the developers.");
            break;

        case 404:
            embed = new ErrorEmbed(`User has no studybot account, create one ${hyperlink("here", config.frontendServerUri)}.`);
            break;

        default:
            embed = new ErrorEmbed(`If you encounter this error, please contact the developers.`);
            break;
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
}