import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getAuthStatus() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function login() {
  window.location.href = `${API_URL}/auth/login`;
}

export async function logout() {
  const response = await api.get("/auth/logout");
  return response.data;
}

export async function getRecords(objectName, offset = 0) {
  const response = await api.get(`/api/records/${objectName}`, {
    params: {
      offset,
      limit: 20,
    },
  });

  return response.data;
}

export async function getRecord(objectName, recordId) {
  const response = await api.get(`/api/records/${objectName}/${recordId}`);
  return response.data;
}

export async function createRecord(objectName, fields) {
  const response = await api.post(`/api/records/${objectName}`, fields);
  return response.data;
}

export async function updateRecord(objectName, recordId, fields) {
  const response = await api.patch(
    `/api/records/${objectName}/${recordId}`,
    fields,
  );
  return response.data;
}

export async function deleteRecord(objectName, recordId) {
  const response = await api.delete(`/api/records/${objectName}/${recordId}`);
  return response.data;
}

export default api;
