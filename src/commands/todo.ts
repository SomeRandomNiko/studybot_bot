import { strikethrough } from "@discordjs/builders";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction, MessageEmbed } from "discord.js";
import Fuse from "fuse.js";
import { addTask, getTask, getTodoList, markTaskDone, removeTask } from "../structures/ApiService";
import { Command } from "../structures/Command";
import { InfoEmbed } from "../structures/Embed";
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
    if(subcommand === "remove")
        return todoRemoveController(interaction);
    return todoViewController(interaction);
}

async function todoAddController(interaction: CommandInteraction) {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description");
    await addTask(interaction.user.id, new Task(title, description || undefined));
    replyTodoList(interaction);
}
async function todoDoneController(interaction: CommandInteraction) {
    const taskId = interaction.options.getString("title", true)
    const task = await getTask(interaction.user.id, taskId);
    await markTaskDone(interaction.user.id, task);
    replyTodoList(interaction);
}

async function todoRemoveController(interaction: CommandInteraction) {
    const taskId = interaction.options.getString("title", true);
    await removeTask(interaction.user.id, taskId);
    replyTodoList(interaction);
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
    const todoList = new TodoList(await getTodoList(interaction.user.id));
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
}

async function replyTask(interaction: CommandInteraction, taskId: string) {
    const task = await getTask(interaction.user.id, taskId);
    const embed = new InfoEmbed();
    embed.setTitle(task.title).description = task.description || null;
    interaction.reply({ embeds: [embed], ephemeral: true })
}