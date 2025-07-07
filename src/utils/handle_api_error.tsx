import axios from 'axios';
import { showToastError } from '../custom_component/toast';

export function handleApiError(error: unknown, fallbackMessage = 'An error occurred') {
    let message = fallbackMessage;

    if (axios.isAxiosError(error)) {
        message =
            error.response?.data?.meta?.message ||
            error.response?.data?.message ||
            error.message;
    } else if (typeof error === 'object' && error !== null && 'meta' in error) {
        const err = error as { meta?: { message?: string } };
        message = err.meta?.message || message;
    }
    if(message=="Fee already exist"){
        showToastError('Fee already paid');
        return;
    }
    showToastError(message);
}
