import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://skillable-3-0-0-1.onrender.com/api/",

  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add a request interceptor to include the token in the headers
newRequest.interceptors.request.use(
  (config) => {
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
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error("API Error:", error.response?.status, error.response?.data);
    
    // Handle specific error codes
    if (error.response) {
      // Unauthorized - redirect to login
      if (error.response.status === 401) {
        // Optional: redirect to login page if token is invalid/expired
        // window.location.href = "/login";
      }
      
      // Forbidden - usually permission issues
      if (error.response.status === 403) {
        // Add custom message if not provided by server
        if (!error.response.data?.message) {
          error.response.data = {
            ...error.response.data,
            message: "You don't have permission to perform this action."
          };
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default newRequest;
