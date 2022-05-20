import { Command } from "../structures/Command";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction, EmbedField, MessageAttachment, MessageComponentInteraction } from "discord.js";
import { ErrorEmbed, InfoEmbed } from "../structures/Embed";
import { bold, hyperlink, italic } from "@discordjs/builders";
import config from "../shared/config";
import { getCachedGrades } from "../structures/Marks";
import Fuse from "fuse.js";

export default new Command({
    name: "marks",
    description: "Displays a List of all your marks",
    options: [
        { name: "subject", description: "The Subject", type: "STRING", required: false, autocomplete: true }
    ],
    autocomplete,
}, gradesController);

async function autocomplete(interaction: AutocompleteInteraction): Promise<ApplicationCommandOptionChoice[]> {

    try {
        const grades = await getCachedGrades(interaction.user.id);

        if (!grades)
            return [];


        const fuse = new Fuse(grades.subjectNames);

        let foundSubjects = fuse.search(interaction.options.getString("subject") || "").map(f => f.item);


        if (!foundSubjects.length)
            foundSubjects = grades.subjectNames;


        return foundSubjects.map(s => {
            return {
                name: s,
                value: s
            }
        });
    } catch (error) {
        return [];
    }
}

function sendError(interaction: CommandInteraction | MessageComponentInteraction, status?: number) {
    let embed;
    switch (status) {
        case 401:
            embed = new ErrorEmbed("Not logged in. If you encounter this error, please contact the developers.");
            break;

        case 403:
            embed = new ErrorEmbed(`You have not connected your ${italic("Digitales Register")} account yet. You can do so ${hyperlink("here", config.frontendServerUri)}.`);
            break;

        case 404:
            embed = new ErrorEmbed(`You have not created a studybot account yet. You can do so ${hyperlink("here", config.frontendServerUri)}.`);
            break;
        default:
            embed = new ErrorEmbed(`If you encounter this error, please contact the developers.`);
            break;
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
}

async function gradesController(interaction: CommandInteraction) {
    const subjectOption = interaction.options.getString("subject");


    const grades = await getCachedGrades(interaction.user.id);

    if (!grades) {
        sendError(interaction, 404);
        return;
    }

    let embedFields: EmbedField[];
    let embed = new InfoEmbed();
    let file: MessageAttachment;

    if (subjectOption) {
        const subject = grades.getSubject(subjectOption);
        const marks = subject?.marksByDate;
        if (!marks) {
            interaction.reply({ embeds: [new ErrorEmbed("No subject with this name was found")], ephemeral: true });
            return;
        }

        embedFields = marks.map(m => {
            return {
                name: `${m.date.toLocaleDateString()} - ${m.type}`,
                value: `${bold(m.mark.toFixed(2))} - ${m.weight}%`,
                inline: true
            }
        });

        embedFields.unshift({ name: "Semester average", value: subject.semesterAverage.toFixed(2), inline: false });

        embed.setDescription(`Subject: ${bold(subjectOption)}`);
        file = new MessageAttachment(subject.renderChart(), "chart.png");


    } else {
        embedFields = grades.subjects.map(s => {
            return {
                name: s.subjectName,
                value: s.semesterAverage ? s.semesterAverage.toFixed(2) : "/",
                inline: true
            }
        });

        embedFields.unshift({ name: "Semester average", value: grades.semesterAverage.toFixed(2), inline: false });

        embed.setDescription(`Subject: ${bold("All")}`);
        file = new MessageAttachment(grades.renderChart(), "chart.png");
    }

    embed.setTitle("Marks");
    embed.addFields(embedFields);
    embed.setImage("attachment://chart.png");

    interaction.reply({ embeds: [embed], ephemeral: true, files: [file] });

}