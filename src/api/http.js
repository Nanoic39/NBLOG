import axios from "axios";

const http = axios.create({ baseURL: "/", timeout: 10000 });

export default http;
