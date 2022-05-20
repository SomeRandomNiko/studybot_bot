import { Interaction, MessageActionRow, Message } from "discord.js";
import { studyTimers } from "..";
import { Command } from "../structures/Command";
import { ErrorEmbed, InfoEmbed, TimerEmbed } from "../structures/Embed";
import stop_timer from "../buttons/stop_timer";
import { getTimer } from "../structures/ApiService";
import start_timer from "../buttons/start_timer";
import { RepliableInteraction } from "../structures/Middleware";
import { hyperlink, time } from "@discordjs/builders";
import config from "../shared/config";

export default new Command({
    name: "timer",
    description: "Start, stop or view your study timer",
    options: [
        { type: "SUB_COMMAND", name: "start", description: "Starts the timer" },
        { type: "SUB_COMMAND", name: "stop", description: "Stops the timer" },
        { type: "SUB_COMMAND", name: "view", description: "Shows your study time and break time" },
    ]
}, timerController);

function makeMessage(type: "study" | "break", timer: any, timeout?: StudyTimeout) {
    const embed = new InfoEmbed();
    embed.setTitle("Study Timer").addFields({ name: "Completed study sessions", value: `${timeout?.streak || 0}` });
    if (type == "study") {
        embed.setDescription("Time to study 📖");
        embed.addFields({ name: "Next Break", value: `${time(Math.round(new Date().getTime() / 1000) + timer.studyTime * 60, "R")}` });
    } else {
        embed.setDescription("Time for a break ☕");
        embed.addFields({ name: "Next Study Session", value: `${time(Math.round(new Date().getTime() / 1000) + timer.breakTime * 60, "R")}` });
    }

    return { embeds: [embed], components: [new MessageActionRow().addComponents(stop_timer)] };
}

function timerController(interaction: Interaction) {
    if (interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "start":
                startTimer(interaction);
                break;
            case "stop":
                stopTimer(interaction);
                break;

            default:
                // View
                viewTimer(interaction);
                break;
        }
    }
}

export async function startTimer(interaction: RepliableInteraction) {
    try {
        
        const timer = await getTimer(interaction.user.id);
        if (timer) {
            if (!studyTimers.has(interaction.user.id)) {
                interaction.reply({ embeds: [new InfoEmbed("⏱️ Timer started")], ephemeral: true });
                sendStudyMessage(interaction, timer);
            } else {
                interaction.reply({ ephemeral: true, embeds: [new InfoEmbed("ℹ️ Timer is already active")] });
            }
        } else {
            interaction.reply({ embeds: [new ErrorEmbed("❌ Error with starting the timer")], ephemeral: true });
        }
    } catch (error) {
        interaction.reply({ embeds: [new ErrorEmbed(`An error occured while retrieving the timer. If you have not created an account yet you can do so ${hyperlink("here", config.frontendServerUri)}. Else try again later.`)], ephemeral: true });
    }

}
export async function stopTimer(interaction: RepliableInteraction) {
    const timeout = studyTimers.get(interaction.user.id);
    if (timeout) {
        clearTimeout(timeout.timeoutHandle);
        await timeout.message.delete();
        studyTimers.delete(interaction.user.id);
        interaction.reply({ ephemeral: true, embeds: [new InfoEmbed("⏱️ Timer stopped")] });
    } else {
        interaction.reply({ ephemeral: true, embeds: [new InfoEmbed("ℹ️ You have no active timer")] });
    }
}
async function viewTimer(interaction: RepliableInteraction) {
    try {
        const timer = await getTimer(interaction.user.id);
        if (timer) {
            interaction.reply({ embeds: [new TimerEmbed(timer)], components: [new MessageActionRow().addComponents(start_timer, stop_timer)], ephemeral: true });
        } else {
            interaction.reply({ embeds: [new ErrorEmbed("❌ Error ")], ephemeral: true });
        }
    } catch (error) {
        interaction.reply({ embeds: [new ErrorEmbed(`An error occured while retrieving the timer. If you have not created an account yet you can do so ${hyperlink("here", config.frontendServerUri)}. Else try again later.`)], ephemeral: true });
    }
}

async function sendBreakMessage(interaction: Interaction, timer: any) {
    const dmChannel = await interaction.user.createDM();
    const timeout = studyTimers.get(interaction.user.id);

    if (timeout) {
        timeout.message.delete();
        timeout.streak++;
        timeout.timeoutHandle = setTimeout(sendStudyMessage, timer?.breakTime * 60000, interaction, timer);
        timeout.message = await dmChannel.send(makeMessage("break", timer, timeout));
    } else {
        const timeout = {
            message: await dmChannel.send(makeMessage("break", timer)),
            streak: 0,
            timeoutHandle: setTimeout(sendStudyMessage, timer?.breakTime * 60000, interaction, timer)
        }
        studyTimers.set(interaction.user.id, timeout);
    }
}

async function sendStudyMessage(interaction: Interaction, timer: any) {
    const dmChannel = await interaction.user.createDM();
    const timeout = studyTimers.get(interaction.user.id);

    if (timeout) {
        timeout.message.delete();
        timeout.timeoutHandle = setTimeout(sendBreakMessage, timer.studyTime * 60000, interaction, timer);
        timeout.message = await dmChannel.send(makeMessage("study", timer, timeout));
    } else {
        const timeout = {
            message: await dmChannel.send(makeMessage("study", timer)),
            streak: 0,
            timeoutHandle: setTimeout(sendBreakMessage, timer.studyTime * 60000, interaction, timer)
        }
        studyTimers.set(interaction.user.id, timeout);
    }
}

export interface StudyTimeout {
    timeoutHandle: NodeJS.Timeout;
    streak: number;
    message: Message;
}