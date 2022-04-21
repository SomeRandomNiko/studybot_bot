import { ButtonInteraction, CommandInteraction, MessageActionRow } from "discord.js";
import { studyTimers } from "..";
import { Command, ExtendedInteraction } from "../structures/Command";
import { ErrorEmbed, InfoEmbed, TimerEmbed } from "../structures/Embed";
import stop_timer from "../buttons/stop_timer";
import { getTimer } from "../structures/ApiService";
import start_timer from "../buttons/start_timer";

export default new Command({
    name: "timer",
    description: "Start, stop or view your study timer",
    options: [
        { type: "SUB_COMMAND", name: "start", description: "Starts the timer" },
        { type: "SUB_COMMAND", name: "stop", description: "Stops the timer" },
        { type: "SUB_COMMAND", name: "view", description: "Shows your study time and break time" },
    ]
}, timerController);

function timerController(interaction: ExtendedInteraction | ButtonInteraction) {
    if(interaction.isCommand()) {
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

export async function startTimer(interaction: ExtendedInteraction | ButtonInteraction) {
    const timer = await getTimer(interaction.user.id);
    if (timer) {
        if (!studyTimers.has(interaction.user.id)) {
            interaction.reply({embeds: [new InfoEmbed("Timer started")], ephemeral: true});
            sendStudyMessage(interaction, timer);
        } else {
            interaction.reply({ephemeral: true, embeds: [new InfoEmbed("Timer is already active")]});
        }
    } else {
        interaction.reply({embeds: [new ErrorEmbed("Error with starting the timer")], ephemeral: true});
    }

}
export async function stopTimer(interaction: ExtendedInteraction | ButtonInteraction) {
    const timeout = studyTimers.get(interaction.user.id);
    if (timeout) {
        clearTimeout(timeout);
        studyTimers.delete(interaction.user.id);
        interaction.reply({ephemeral: true, embeds: [new InfoEmbed("Timer stopped")]});
    } else {
        interaction.reply({ephemeral: true, embeds: [new InfoEmbed("You have no active timer")]});
    }
}
async function viewTimer(interaction: ExtendedInteraction | ButtonInteraction) {
    const timer = await getTimer(interaction.user.id);
    if (timer) {
        interaction.reply({embeds: [new TimerEmbed(timer)], components: [new MessageActionRow().addComponents(start_timer, stop_timer)], ephemeral: true});
    } else {
        interaction.reply({embeds: [new ErrorEmbed("Error retrieving the timer")], ephemeral: true});
    }
}

async function sendBreakMessage(interaction: ExtendedInteraction | ButtonInteraction, timer: any) {
    const dmChannel = await interaction.user.createDM();
    dmChannel.send(`☕ It's time for a break. Study time starts in ${timer.breakTime} minute(s).`);

    const timeout = setTimeout(sendStudyMessage, timer?.breakTime * 60000, interaction, timer);
    studyTimers.set(interaction.user.id, timeout);
}

async function sendStudyMessage(interaction: ExtendedInteraction | ButtonInteraction, timer: any) {
    const dmChannel = await interaction.user.createDM();
    dmChannel.send(`📖 Time to study. Break starts in ${timer.studyTime} minute(s).`);

    const timeout = setTimeout(sendBreakMessage, timer.studyTime * 60000, interaction, timer);
    studyTimers.set(interaction.user.id, timeout);
}