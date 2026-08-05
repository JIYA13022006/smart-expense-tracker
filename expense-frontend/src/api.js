import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8082",
});

export const login = (data) => API.post("/api/auth/login", data);

export const getExpenses = (token) =>
  API.get("/api/expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getRecurring = (token) =>
  API.get("/api/recurring", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addRecurring = (token, data) =>
  API.post("/api/recurring", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteRecurring = (token, id) =>
  API.delete(`/api/recurring/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const applyRecurring = (token, id) =>
  API.post(`/api/recurring/${id}/apply`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getBillReminders = (token) =>
  API.get("/api/bills/reminders", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const markBillPaid = (token, expenseId, paymentMethod) =>
  API.post(`/api/bills/mark-paid/${expenseId}`, { paymentMethod }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const analyzeExpenses = (data) => API.post("/api/ai/analyze", data);
