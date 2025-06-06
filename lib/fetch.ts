const BASE_URL = '/';


const api = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // Construct full URL
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? url.slice(1) : url}`;
    
    // Merge default headers with provided headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers,
            credentials: 'include',
        });

        // Handle auth errors (equivalent to response interceptor)
        if (response.status === 401) {
            console.error('Authentication error - you may need to reconnect your wallet');
            
            // Trigger a global auth error event that UserContext can listen for
            window.dispatchEvent(new CustomEvent('auth-error'));
        }

        return response;
    } catch (error) {
        return Promise.reject(error);
    }
};

// Helper methods for common HTTP methods (to mimic axios API)
const fetchApi = {
    get: (url: string, config?: RequestInit) => 
        api(url, { ...config, method: 'GET' }),
    
    post: (url: string, data?: any, config?: RequestInit) => 
        api(url, { 
            ...config, 
            method: 'POST', 
            body: data ? JSON.stringify(data) : undefined 
        }),
    
    put: (url: string, data?: any, config?: RequestInit) => 
        api(url, { 
            ...config, 
            method: 'PUT', 
            body: data ? JSON.stringify(data) : undefined 
        }),
    
    delete: (url: string, config?: RequestInit) => 
        api(url, { ...config, method: 'DELETE' }),
    
    patch: (url: string, data?: any, config?: RequestInit) => 
        api(url, { 
            ...config, 
            method: 'PATCH', 
            body: data ? JSON.stringify(data) : undefined 
        }),
};

export default fetchApi;