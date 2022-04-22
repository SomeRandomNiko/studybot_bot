import { Command } from "../structures/Command";
import { ExtendedEmbed } from "../structures/Embed";
import { RepliableInteraction } from "../structures/Middleware";

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