const getCurrentUser = () => {
  const userData = localStorage.getItem("currentUser");
  if (!userData || userData === "null") return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export default getCurrentUser;