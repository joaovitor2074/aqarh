// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro inesperado");
    }

    return response.json();
}
