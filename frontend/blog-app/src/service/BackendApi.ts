import axios, {type AxiosRequestConfig } from "axios";
import { Roles } from "../enums/Roles";

// ---- INTERFACES ----
export interface UserRegistration {
    userId?: number;
    email: string;
    password: string;
    name: string;
    description?: string;
    role?: string;
}



export interface UserLogin {
    email: string;
    password: string;
}

export interface PagedResponse<T> {
    data: any;
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
}

export interface  UserDto{
    id?: number;
    name: string;
    email: string;
    description?: string;
    roles: Roles[];
    createdAt:string;
    updatedAt:string;
    post?: string[];
    comments?:string[]
    likes?: number;
    views?: number;
}

// Profile shapes returned by /user/get-user-profile
export interface UserProfilePost {
    id: number;
    title: string;
    content: string;
    category?: string;
    likes?: number;
    views?: number;
    createdAt?: string;
    updatedAt?: string;
    isLiked?: boolean;
}

export interface UserProfileComment {
    id: number;
    content: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    description?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    posts: UserProfilePost[];
    comments: UserProfileComment[];
}

export interface PostDto{
    id?: number;
    title: string;
    content: string;
    category?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        description?: string;
        role: string;
    };
    users?: string;
    createdAt?:string;
    updatedAt?:string;
    comments?:string[];
    likes?: number;
    views?: number;
    isLiked?: boolean;
}

export interface CommentDto{
    id?: number;
    content: string;
    users?: string;
    posts?: string;
    createdAt: string;
    updatedAt: string;
}





export interface AuthsResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
    role: Roles[];
    name: string;
    message: string;
    timestamp: string;
    requestId: string;
}



export interface ApiError {
    status?: number;
    message: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    timestamp: Date;
    requestId: string;
}



// ---- AXIOS CLIENT ----
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});



// ---- SERVICE CLASS ----
export default class BackendApi {
    // ---- CSRF TOKEN HANDLING ----
    static getCsrfToken(): string | null {
        const name = 'XSRF-TOKEN=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length);
            }
        }
        return null;
    }

    static async fetchCsrfToken() {
        try {
            await apiClient.get('/csrf');
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }

    // ---- TOKEN HANDLING (Deprecated - kept for role storage only) ----
    static getAccessToken() {
        return null; // Tokens now in cookies
    }

    static getRefreshToken() {
        return null; // Tokens now in cookies
    }

    static getAccessTokenExpiration(): Date | null {
        return null; // Not needed with cookies
    }

    static getRefreshTokenExpiration(): Date | null {
        return null; // Not needed with cookies
    }

    static setTokens(
        accessToken: string,
        refreshToken: string,
        accessTokenExpiration: string,
        refreshTokenExpiration: string
    ) {
        // Tokens set in cookies by backend, only store role
    }

    static clearTokens() {
        localStorage.removeItem("roles1");
    }

    // ---- TOKEN VALIDATION ----
    static isAccessTokenValid(): boolean {
        return true; // Backend validates cookie
    }

    static isRefreshTokenValid(): boolean {
        return true; // Backend validates cookie
    }

    static getTimeUntilAccessTokenExpiration(): number {
        return 3600000; // 1 hour default
    }

    // ---- CENTRALIZED ERROR HANDLING ----
    private static handleError(error: unknown): ApiError {
        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data;
            return {
                status: error.response?.status,
                message: responseData?.message || error.message,
            };
        }
        return { message: "An unexpected error occurred" };
    }

    // ---- GENERIC REQUESTS ----
    private static async get<T>(endpoint: string, config?: AxiosRequestConfig) {
        try {
            const response = await apiClient.get<T>(endpoint, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private static async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig) {
        try {
            const response = await apiClient.post<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private static async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig) {
        try {
            const response = await apiClient.put<T>(endpoint, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private static async delete<T>(endpoint: string, config?: AxiosRequestConfig) {
        try {
            const response = await apiClient.delete<T>(endpoint, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }



    // ---- AUTH ----
    static async registerUser(registrationData: UserRegistration) {
        const response = await this.post<AuthsResponse>("/auth/signup", registrationData);
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }

    static async loginUser(loginData: UserLogin) {
        const response = await this.post<AuthsResponse>("/auth/login", loginData);
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }

    static async registerAdmin(adminData: UserRegistration) {
        const response = await this.post<AuthsResponse>("/auth/admin", adminData);
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }



    static async logoutUser() {
        const response = await this.post<ApiResponse<any>>("/auth/logout", {});
        this.clearTokens();
        return response;
    }



    static async refreshAccessToken() {
        // Backend handles refresh via cookies
        const response = await apiClient.post<AuthsResponse>("/auth/refresh-token", {});
        localStorage.setItem("roles1", JSON.stringify(response.data.role));
        return response.data.accessToken;
    }

    // ---- ROLE HELPERS ----
    static getRoles(): Roles[] {
        const roles = localStorage.getItem("roles1");
        
        if (!roles) return [];
        
        const parsedRoles = JSON.parse(roles);
        console.log('Parsed roles:', parsedRoles);
        
        // Handle both string and array formats from backend
        let roleArray: string[];
        if (typeof parsedRoles === 'string') {
            roleArray = [parsedRoles];
        } else if (Array.isArray(parsedRoles)) {
            roleArray = parsedRoles;
        } else {
            return [];
        }
        
        // Remove ROLE_ prefix if present and convert to Roles enum
        return roleArray.map(role => {
            const cleanRole = role.startsWith('ROLE_') ? role.substring(5) : role;
            return cleanRole as Roles;
        });
    }

    static isUser() {
        return this.getRoles().includes(Roles.USER);
    }

    static isAdmin() {
        return this.getRoles().includes(Roles.ADMIN);
    }



    static hasAnyRole(allowedRoles: Roles[]) {
        return this.getRoles().some((role) => allowedRoles.includes(role));
    }

    static isAuthenticated() {
        return this.getRoles().length > 0;
    }

    // ---- USER ----
    static async getAllUsers(page: number = 0, size: number = 10) {
        return this.get<PagedResponse<UserDto>>(`/user/list?page=${page}&size=${size}`);
    }

    static async createUser(userData: Partial<UserRegistration>) {
        return this.post<UserDto>('/user/create', userData);
    }

    static async getTotalUsers() {
        return this.get<ApiResponse<number>>(`/user/total`);
    }

    static async getUserById(userId: number) {
        return this.get<UserRegistration>(`/user/get-user/${userId}`);
    }

    static async getUserProfile() {
        return this.get<ApiResponse<UserProfile>>("/user/get-user-profile");
    }

    static async getUserPostHistoryByUserId(userId: number) {
        return this.get<any[]>(`/user/posts-history/${userId}`);
    }

    static async deleteUser(userId: number) {
        return this.delete<ApiResponse<any>>(`/user/${userId}`);
    }

    static async updateUser(userId: number, updateData: Partial<UserRegistration>) {
        return this.put<UserRegistration>(`/user/${userId}`, updateData);
    }


    // -----Post Blog------
    static async deletePostBlog(postId: number) {
        return this.delete<ApiResponse<PostDto>>(`/post/${postId}`);
    }

    static async getPostById(postId: number) {
        return this.get<ApiResponse<PostDto>>(`/post/${postId}`);
    }

    static async getTotalPost() {
        return this.get<ApiResponse<number>>(`/post/total`);
    }

    static async getAllPost(page:number=0, size:number= 10) {
        return this.get<ApiResponse<PagedResponse<PostDto>>>(`/post/list?page=${page}&size=${size}`);
    }

    static async createPost(PostData: PostDto) {
        return this.post<ApiResponse<PostDto>>("/post", PostData);
    }
    static async updatePost(PostData: PostDto, postId: number) {
        return this.put<ApiResponse<PostDto>>(`/post/${postId}`, PostData);
    }



    // ----- Comment Blog------
    static async deletePostComment(commentId: number) {
        return this.delete<ApiResponse<CommentDto>>(`/comment/${commentId}`);
    }

    static async getPostCommentById(commentId: number) {
        return this.get<ApiResponse<CommentDto>>(`/comment/${commentId}`);
    }
    static async getTotalPostComment() {
        return this.get<ApiResponse<number>>(`/comment/total`);
    }

    static async getAllPostComment(page:number=0,size:number=10) {
        return this.get<ApiResponse<PagedResponse<CommentDto>>>(`/comment/post?page=${page}&size=${size}`);
    }

    static async getCommentsByPostId(postId: number, page:number=0, size:number=10) {
        return this.get<ApiResponse<PagedResponse<CommentDto>>>(`/comment/post/${postId}?page=${page}&size=${size}`);
    }

    static async createPostComment(CommentData: CommentDto, postId:number) {
        return this.post<ApiResponse<CommentDto>>(`/comment/${postId}`, CommentData);
    }
    static async updatePostComment(CommentData: CommentDto, commentId: number) {
        return this.put<ApiResponse<CommentDto>>(`/comment/${commentId}`, CommentData);
    }

    //-----AI chat -------
    static async askAi(prompt: string){
        return this.get<ApiResponse<string>>("/ai/chat", {
            params: {prompt},
        })
    }

    // ---- LIKES ----
    static async likePost(postId: number) {
        return this.post<ApiResponse<any>>(`/post/${postId}/like`, {});
    }

    static async unlikePost(postId: number) {
        return this.delete<ApiResponse<any>>(`/post/${postId}/like`);
    }

    // ---- CATEGORIES ----
    static async getCategories() {
        return this.get<ApiResponse<string[]>>('/post/categories');
    }

    static async getPostsByCategory(category: string, page: number = 0, size: number = 10) {
        // encode category to safely pass in URL
        return this.get<ApiResponse<PagedResponse<PostDto>>>(`/post/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);
    }


}

// ---- AXIOS INTERCEPTORS ----
apiClient.interceptors.request.use(
    (config) => {
        // Add CSRF token to non-GET requests
        if (config.method && config.method.toUpperCase() !== 'GET') {
            const csrfToken = BackendApi.getCsrfToken();
            if (csrfToken) {
                config.headers['X-XSRF-TOKEN'] = csrfToken;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await BackendApi.refreshAccessToken();
                return apiClient(originalRequest);
            } catch (refreshError) {
                BackendApi.clearTokens();
                window.location.href = "/auth/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);