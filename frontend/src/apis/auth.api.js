import apiClient from "./index";

export const register = async (data) => {
    try {
        console.log('register data',data);
        const response = await apiClient.post('/user/register', data);
        console.log('register response',response);
        
        return response.data
    }
    catch (error) {
        return error?.response.data;
    }
}

export const login = async (data) => {
    try {
        const response = await apiClient.post('/user/login', data);
        return response.data;
    }
    catch (error) {
        return error?.response.data;
    }
}
export const getUserById = async (data) => {

    try {
        const response = await apiClient.post('/user/getUserById', data);
        return response.data;
    }
    catch (error) {
        return error?.response.data;
    }
}

