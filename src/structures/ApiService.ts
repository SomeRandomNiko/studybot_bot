import axios from "axios";
import config from "../shared/config";
import jwt from "jsonwebtoken";
import { Task } from "./TodoList";

const axiosInstance = axios.create({ baseURL: config.apiServerUri });

function generateAuthHeader(userId: string) {
    const token = jwt.sign({ discordId: userId }, config.jwtSecret, { expiresIn: 60 });
    return { Authorization: "Bearer " + token };
}

export async function getTodoList(userId: string) {
    try {
        const response = await axiosInstance.get("/todo/all", { headers: generateAuthHeader(userId) });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getTask(userId: string, taskId: string) {
    try {
        const { data } = await axiosInstance.get(`/todo/${taskId}`, { headers: generateAuthHeader(userId) });
        return new Task(data.title, data.description, new Date(data.dueDate), data.done, data._id);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function markTaskDone(userId: string, task: Task) {
    try {
        const { data } = await axiosInstance.put(
            `/todo/${task._id}`,
            {
                _id: task._id,
                title: task.title,
                description: task.description,
                done: true,
                dueDate: task.date
            },
            { headers: generateAuthHeader(userId) }
        );
        return new Task(data.title, data.description, new Date(data.dueDate), data.done, data._id);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function removeTask(userId:string, taskId: string) {
    try {
        await axiosInstance.delete(`/todo/${taskId}`, { headers: generateAuthHeader(userId) });
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function addTask(userId: string, task: Task) {
    try {
        const response = await axiosInstance.post(
            "/todo/",
            {
                title: task.title,
                description: task.description,
                done: false,
                dueDate: task.date
            },
            { headers: generateAuthHeader(userId) }
        );
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getUserData(userId: string) {
    try {
        const response = await axiosInstance.get("/user/me", { headers: generateAuthHeader(userId) });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getGrades(userId: string) {
    try {
        const response = await axiosInstance.get("/digreg/grades", { headers: generateAuthHeader(userId) });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function getTimer(userId: string) {
    try {
        const response = await axiosInstance.get("/timer", { headers: generateAuthHeader(userId) });
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function isDigregConnected(userId: string) {
    try {
        const userData = await getUserData(userId);
        return !!userData.digreg;
    } catch (error) {
        return Promise.reject(error);
    }
}