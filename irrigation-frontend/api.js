import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:5000/api", // replace with your ngrok URL if remote
});

export default API;
