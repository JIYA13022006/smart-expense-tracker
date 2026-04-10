import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081",
});

export const login = (data) => API.post("/api/auth/login", data);

export const getExpenses = (token) =>
  API.get("/api/expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
