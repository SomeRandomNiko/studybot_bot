import axios from "axios";
import config from "../config";
import jwt from "jsonwebtoken";

const axiosInstance = axios.create({ baseURL: config.apiServerUri });

function generateAuthHeader(userId: string) {
    const token = jwt.sign({ discordId: userId }, config.jwtSecret, { expiresIn: 60 });
    return { Authorization: "Bearer " + token };
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