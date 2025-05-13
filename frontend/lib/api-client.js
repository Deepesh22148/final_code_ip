import axios from "axios";
import {baseURL} from "../utils/constants.js";

const apiClient = axios.create({
    baseURL : baseURL
})

export default apiClient;
