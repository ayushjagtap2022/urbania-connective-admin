import axios from "axios";

const api = axios.create({
  baseURL: "https://urbania-connective-server.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Making request:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      const errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      };
      console.error("API Error:", errorDetails);

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log("Unauthorized access, clearing auth data");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return Promise.reject(new Error("Please log in again"));
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.log("Forbidden access");
        return Promise.reject(
          new Error("Access denied. Admin privileges required.")
        );
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.log("Resource not found");
        return Promise.reject(
          new Error("The requested resource was not found")
        );
      }

      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        console.log("Server error");
        return Promise.reject(
          new Error(
            "An internal server error occurred. Please try again later."
          )
        );
      }

      return Promise.reject(
        new Error(
          error.response.data?.message ||
            `Request failed with status ${error.response.status}`
        )
      );
    }

    if (error.request) {
      console.error("No response received:", error.request);
      return Promise.reject(new Error("No response received from server"));
    }

    console.error("Error setting up request:", error.message);
    return Promise.reject(error);
  }
);

export default api;
