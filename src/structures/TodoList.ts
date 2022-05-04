export class TodoList {
    private tasks: Task[] = []
    constructor(todoListData: any[]) {
        this.tasks = todoListData.map(t => new Task(t.title, t.description, new Date(t.dueDate), t.done, t._id));
    }

    get allTasks() {
        return this.tasks;
    }

    get doneTasks() {
        return this.tasks.filter(t => t.done);
    }

    get undoneTasks() {
        return this.tasks.filter(t => !t.done);
    }
}

export class Task {
    constructor(public title: string, public description?: string, public date?: Date, public done: boolean = false, public _id?: string) {

    }

    async delete() {
        // delete task
    }

    async markDone() {
        // mark task as done
    }
}