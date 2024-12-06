import axios from 'axios';


const API_URL = 'https://jsonplaceholder.typicode.com'; // Mock API

export const loginApi = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users`, { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};