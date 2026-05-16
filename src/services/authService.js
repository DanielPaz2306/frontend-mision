import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/auth`;

export const loginService = async (username, password) => {

    const response = await axios.post(`${API_URL}/login`, {username, password});
    return response.data;

}