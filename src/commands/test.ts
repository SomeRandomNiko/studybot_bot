import { ButtonInteraction } from "discord.js";
import { Command, ExtendedInteraction } from "../structures/Command";
import { ExtendedEmbed } from "../structures/Embed";

export default new Command({
    name: "test",
    description: "Test command",
}, testController)

export async function testController(interaction: ExtendedInteraction | ButtonInteraction) {
    interaction.reply({
        embeds: [new ExtendedEmbed({
            title: "Test",
            description: "This is a test",
            color: 0x696969
        })]
    })
}