
import apiClient from "./index";
// const apiBaseUrl = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function retrievePrompt() {
    return apiClient.get(`/prompt-retrieve`).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function promptUpdation(data) {
    return apiClient.post(`.`, data).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function regenerateResponse(data) {
    return apiClient.post(`/regenerate-response`, data).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}


export async function analyzeResponse(data) {
    return apiClient.post(`/analyze-report`, data).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}