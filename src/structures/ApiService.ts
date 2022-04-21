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
        console.log("Success", response.data);
        return response.data;
    } catch (error) {
        console.log("Error", error);
        return Promise.reject(error);
    }
}