import axios from "axios";

// Determine if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Create a function to determine the appropriate base URL for each request
const getBaseURL = (url) => {
  // For community endpoints, use local server in development
  if (isDevelopment
    //  && (url.startsWith('/communities') || url.includes('communities'))
  ) {
    // return 'http://localhost:8080/api/';
  }
  // For all other endpoints, use production server
  return "https://skillable-3-0-0-1.onrender.com/api/";
};

// Create axios instance with dynamic baseURL
const newRequest = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add a request interceptor to include the token in the headers and set dynamic baseURL
newRequest.interceptors.request.use(
  (config) => {
    // Set the baseURL dynamically based on the request URL
    config.baseURL = getBaseURL(config.url);
    
    // Add authorization token
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.accessToken) {
      config.headers.Authorization = `Bearer ${currentUser.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors consistently
newRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem("currentUser")); } catch { return null; }
    })();
    const hasAuthHeader = !!error.config?.headers?.Authorization;

    if (status === 401) {
      // Suppress noisy 401 logs
      // If we thought we were authenticated, clear stale token and optionally redirect
      if (hasAuthHeader || (currentUser && currentUser.accessToken)) {
        localStorage.removeItem("currentUser");
        // Only redirect if not already on public auth pages
        const publicPaths = ["/login", "/register", "/verify-email/"];
        const path = typeof window !== "undefined" ? window.location.pathname : "";
        if (!publicPaths.some(p => path.startsWith(p))) {
          // window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    // Forbidden - add a friendly message if missing
    if (status === 403) {
      if (!error.response.data?.message) {
        error.response.data = {
          ...error.response.data,
          message: "You don't have permission to perform this action."
        };
      }
    } else {
      // Log other errors for debugging
      console.error("API Error:", status, error.response?.data, "on", url);
    }

    return Promise.reject(error);
  }
);

export default newRequest;
