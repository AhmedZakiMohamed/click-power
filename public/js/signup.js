import axios from "axios";
import { showAlert } from "./alert.js";

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    

    if (res.data.status === "success") {
      showAlert("success", "Account created successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong!";
    showAlert("error", message);
  }
};