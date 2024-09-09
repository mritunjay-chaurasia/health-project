import apiClient from "apis";

export async function globalSearch(response, requestData) {
    return apiClient.post(`/searchHistory?q=${response}`, requestData).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}