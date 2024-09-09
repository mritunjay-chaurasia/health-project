// import axios from 'axios';
import apiClient from "./index";

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiClient.post(`/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response && response.data) {
            return response.data;
        } else {
            throw new Error("Empty response received");
        }
    } catch (error) {
        console.error("Error while uploading file:", error);
        const errorMessage = error.response?.data?.message || 'Error while uploading file';
        return { error: errorMessage };
    }
};

export const updateChatMessage = async (data) => {
    return apiClient.put(`/update-message`, data).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function retrieveAllFile(data) {
    return apiClient.get(`/file-retrieve?page=${data.page}&limit=${data.limit}`).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function retrieveFileById(id) {
    return apiClient.get(`/retrieveById/${id}`).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function fetchExcelData(data) {
    return apiClient.post(`/retrieveExcelData`,data).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}

export async function fetchAllSampleReports() {
    return apiClient.get(`/all-sample-reports`,).then((response) => {
        if (response) {
            return response.data;
        }
        return Promise.reject();
    });
}