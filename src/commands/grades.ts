import { Command } from "../structures/Command";
import { CommandInteraction, Interaction, MessageAttachment, MessageComponentInteraction } from "discord.js";
import { getGrades } from "../structures/ApiService";
import { AxiosError } from "axios";
import { ErrorEmbed, GradesDataEmbed } from "../structures/Embed";
import { hyperlink, italic } from "@discordjs/builders";
import config from "../shared/config";
import { createCanvas } from "canvas";
import { Chart } from "chart.js";
import chroma from "chroma-js";

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


            const sortGradeByDate = (a: any, b: any) => a.x < b.x ? -1 : 1;

            const datasets = gradesData.flatMap((s: { grades: any[]; subject: any; }, index: any) => {
                return s.grades.length ? [{
                    backgroundColor: chroma.hsl(index / gradesData.length * 360, .8, .8).hex("rgb"),
                    borderColor: chroma.hsl(index / gradesData.length * 360, .8, .5).hex("rgb"),
                    label: s.subject,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.6,
                    pointRadius: 0,
                    data: s.grades.map((g: { date: any; grade: any; weight: any; }) => {
                        return {
                            x: g.date as any,
                            y: g.grade,
                            r: g.weight
                        }
                    }).sort(sortGradeByDate),
                }] : [];
            });

            const canvas = createCanvas(500, 500)
            const ctx = canvas.getContext('2d')

            const myChart = new Chart(ctx, {
                type: "line",
                data: { datasets },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                        y: {
                            max: 11,
                            min: 3,
                            ticks: {
                                stepSize: 1,
                            }
                        }
                    }
                }
            });

            interaction.reply({ embeds: [new GradesDataEmbed(interaction.user, gradesData, subjectSearch?.toString())], files: [new MessageAttachment(canvas.createPNGStream(), "chart.png")], ephemeral: true })
        } catch (error) {
            console.log(error)
            const status = (error as AxiosError).response?.status;
            sendError(interaction, status);
        }
    }
}