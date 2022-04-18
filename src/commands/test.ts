import { ButtonInteraction } from "discord.js";
import { Command, ExtendedInteraction } from "../structures/Command";
import { ExtendedEmbed } from "../structures/Embed";

export default new Command({
    name: "test",
    description: "Test command",
}, testController)

export async function testController(interaction: ExtendedInteraction | ButtonInteraction) {
    interaction.followUp({
        embeds: [new ExtendedEmbed("success", {
            title: "Test",
            description: "This is a test",
        })]
    })
}