import { useState } from "react";
import { LoginFormValues } from "../../form_values/form_value";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../redux/auth_slice";
import { API_ROUTES } from "../../utils/api_routes";
import Http from "../../utils/http";
import { showToastError } from "../../custom_component/toast";

export const usePasswordToggle = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return {
        showPassword,
        togglePasswordVisibility
    };
};

export const useLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await Http.post(API_ROUTES.LOGIN, data);
            const responseData = response?.data;
            
            if (responseData?.success) {
                const token = responseData?.token;
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('isLoggedIn', 'true');
                    const profileResponse = await Http.get(`${API_ROUTES.PROFILE}/${responseData.user._id}`);
                    if (profileResponse?.data?.data) {
                        const data = profileResponse?.data?.data;
                        dispatch(setAuth({
                            user: data,
                            token,
                        }));
                       
                        navigate('/');
                    } else {
                        showToastError('Login failed');
                    }
                } else {
                    showToastError('Login failed');
                }
            } else {
                const errorMessage = responseData?.error || 'Login failed';
                showToastError(errorMessage);
            }
        } catch (err: any) {
            showToastError(err?.error || "Login failed");
        }
    };

    return { onSubmit };
};