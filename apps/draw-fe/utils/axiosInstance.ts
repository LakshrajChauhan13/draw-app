import axios from "axios";

export const axiosTnstance = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

axiosTnstance.interceptors.response.use(
    (response) => {
        // If the request succeeds, just return the response normally
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is due to an expired token (401 or 403) 
        // AND ensure we haven't already tried to retry this exact request
        if (
            error.response && 
            (error.response.status === 401 || error.response.status === 403) && 
            !originalRequest._retry
        ) {
            originalRequest._retry = true; // Mark this request as retried to prevent infinite loops

            try {
                // Attempt to hit the refresh endpoint
                // The browser will automatically send the refreshToken cookie here
                await axiosTnstance.post('/refresh');

                // If successful, the backend just set a new accessToken cookie!
                // Now, perfectly retry the original request that failed
                return axiosTnstance(originalRequest);
                
            } catch (refreshError) {
                // If the refresh token is also expired or invalid, log the user out
                console.error("Session expired. Please log in again.");
                
                // Redirect to your sign-in page
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin';
                }
                
                return Promise.reject(refreshError);
            }
        }

        // For all other errors (404, 500, etc.), just reject the promise normally
        return Promise.reject(error);
    }
);