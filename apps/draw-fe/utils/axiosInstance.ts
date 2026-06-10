import axios from "axios";

export const axiosTnstance = axios.create({
    baseURL: "http://localhost:3000"
})