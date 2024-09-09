import axios from 'axios';
import { USER_TOKEN } from '../constants';
const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`
})

apiClient.interceptors.request.use((request) => {
  const accessToken = localStorage.getItem(USER_TOKEN);
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the response status is 401 (Unauthorized)
    if (error.response && error.response.status === 401 && error.response.data?.message === 'Unauthorised') {
      // localStorage.removeItem(USER_TOKEN);
      return window.location = '/login';
    }
    return Promise.reject(error);
  }
);



export default apiClient;