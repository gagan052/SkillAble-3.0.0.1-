import axios from "axios";

// Determine if we're in development or production
const isDevelopment = import.meta.env.DEV;

// Create a function to determine the appropriate base URL for each request
const getBaseURL = (url) => {
  // For community endpoints, use local server in development
  if (isDevelopment
     && (url.startsWith('/communities') || url.includes('communities'))
  ) {
    return 'http://localhost:8080/api/';
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
