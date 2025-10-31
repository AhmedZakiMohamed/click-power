import axios from "axios";
import { showAlert } from "./alert.js";

export const resetPassword = async (password, passwordConfirm, token) => {
    try{
        const url = `/api/v1/users/resetPassword/${token}`;
        const res = await axios({
            method: 'PATCH',
            url,
            data: {
                password,
                passwordConfirm
            }
        });
        if(res.data.status === 'success'){
            showAlert('success', 'Password reset successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }catch(err){
        showAlert('error', err.response.data.message);
    }
    };

