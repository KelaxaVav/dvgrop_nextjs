type Listener = (loading: boolean) => void;

let listeners: Listener[] = [];

export const setLoading = (state: boolean) => {
    listeners.forEach(listener => listener(state));
};

export const subscribeLoading = (callback: Listener) => {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};