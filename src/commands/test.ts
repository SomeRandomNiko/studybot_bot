import { createCanvas } from "canvas";
import { Chart } from "chart.js";
import { MessageAttachment } from "discord.js";
import { Command } from "../structures/Command";
import { ExtendedEmbed } from "../structures/Embed";
import { RepliableInteraction } from "../structures/Middleware";
import chroma from "chroma-js";
import 'chartjs-adapter-moment';

export default new Command({
    name: "test",
    description: "Test command",
}, testController)

export async function testController(interaction: RepliableInteraction) {

    interaction.reply({
        embeds: [new ExtendedEmbed({
            title: "Test",
            description: "This is a test",
            color: 0x696969
        })]
    })
}