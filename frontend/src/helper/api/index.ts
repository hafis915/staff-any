import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({path : '../../../.env.example'})

export const getAxiosInstance = () => {
  console.log(process.env.REACT_APP_API_BASE_URL, "<<")
  return axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api/v1",
  });
};
