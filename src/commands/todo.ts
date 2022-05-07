import { strikethrough } from "@discordjs/builders";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction, MessageEmbed } from "discord.js";
import Fuse from "fuse.js";
import { addTask, getTask, getTodoList, markTaskDone, removeTask } from "../structures/ApiService";
import { Command } from "../structures/Command";
import { ErrorEmbed, InfoEmbed } from "../structures/Embed";
import { Task, TodoList } from "../structures/TodoList";

export default new Command({
    name: "todo",
    description: "Manage your todo list",
    options: [
        {
            name: "view", description: "View your Tasks", type: "SUB_COMMAND", options: [
                { name: "title", description: "Title of the task", type: "STRING", required: false, autocomplete: true }
            ]
        },
        {
            name: "add", description: "Add a new task", type: "SUB_COMMAND", options: [
                { name: "title", description: "Title of the task", type: "STRING", required: true },
                { name: "description", description: "Description of the task", type: "STRING", required: false },
            ]
        },
        {
            name: "done", description: "Mark a task as done", type: "SUB_COMMAND", options: [
                { name: "title", description: "Title of the task", type: "STRING", required: true, autocomplete: true }
            ]
        },
        {
            name: "remove", description: "Remove a Task", type: "SUB_COMMAND", options: [
                { name: "title", description: "Title of the task", type: "STRING", required: true, autocomplete: true }
            ]
        },
    ],
    autocomplete: todoAutocomplete
}, todoController);

async function todoAutocomplete(interaction: AutocompleteInteraction): Promise<ApplicationCommandOptionChoice[]> {
    // TODO fi
    const option = interaction.options.getFocused().toString();

    const todoList = new TodoList(await getTodoList(interaction.user.id));

    const subcommand = interaction.options.getSubcommand();

    const foundTasks = new Fuse(subcommand === "done" ? todoList.undoneTasks : todoList.allTasks, { keys: ["title"] }).search(option);

    const tasks = foundTasks.length ? foundTasks.map(t => t.item) : todoList.allTasks;

    return tasks.map(t => {
        return {
            name: t.title,
            value: t._id!
        }
    })
}


function todoController(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add")
        return todoAddController(interaction);
    if (subcommand === "done")
        return todoDoneController(interaction);
    if (subcommand === "remove")
        return todoRemoveController(interaction);
    return todoViewController(interaction);
}

async function todoAddController(interaction: CommandInteraction) {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description");
    try {
        await addTask(interaction.user.id, new Task(title, description || undefined));
        replyTodoList(interaction);
    } catch (error) {
        replyError(interaction, "An error occured while adding your Task. Try again later.");
    }
}
async function todoDoneController(interaction: CommandInteraction) {
    const taskId = interaction.options.getString("title", true)
    try {
        const task = await getTask(interaction.user.id, taskId);
        await markTaskDone(interaction.user.id, task);
        replyTodoList(interaction);
    } catch (error) {
        replyError(interaction, "An error occured while marking your Task as done. Maybe the title you entered is invalid. Try again later.");
    }
}

async function todoRemoveController(interaction: CommandInteraction) {
    const taskId = interaction.options.getString("title", true);
    try {
        await removeTask(interaction.user.id, taskId);
        replyTodoList(interaction);
    } catch (error) {
        replyError(interaction, "An error occured while removing your Task. Maybe the title you entered is invalid. Try again later.");
    }
}

function todoViewController(interaction: CommandInteraction) {
    const taskId = interaction.options.getString("title")
    if (taskId) {
        replyTask(interaction, taskId);
    } else {
        replyTodoList(interaction);
    }
}

async function replyTodoList(interaction: CommandInteraction) {
    try {
        const todoListData = await getTodoList(interaction.user.id);
        const todoList = new TodoList(todoListData);
        let description;

        if (todoList.allTasks.length)
            description = [
                ...todoList.undoneTasks.map(t => t.title),
                ...todoList.doneTasks.map(t => strikethrough(t.title)),
            ].join("\n");
        else description = "Your todo list is empty";
        const embed = new InfoEmbed();
        embed.setTitle("Todo list").setDescription(description);
        interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
        replyError(interaction, "An error occured while fetching your Todo List. Try again later.");
    }
}

async function replyTask(interaction: CommandInteraction, taskId: string) {
    try {
        const task = await getTask(interaction.user.id, taskId);
        const embed = new InfoEmbed();
        embed.setTitle(task.title).description = task.description || null;
        interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        replyError(interaction, "An error occured while fetching your Task. Maybe the title you entered is invalid. Try again later.");
    }
}

function replyError(interaction: CommandInteraction, message?: string) {
    interaction.reply({ embeds: [new ErrorEmbed(message || "An Error occured. Please contact the developers.")], ephemeral: true });
}