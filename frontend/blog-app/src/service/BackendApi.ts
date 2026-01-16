import axios, {type AxiosRequestConfig } from "axios";
import { Roles } from "../enums/Roles";

// ---- INTERFACES ----
export interface UserRegistration {
    userId?: number;
    email: string;
    password: string;
    name: string;
}



export interface UserLogin {
    email: string;
    password: string;
}

export interface PagedResponse<T> {
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
    roles: Roles[];
    createdAt:string;
    updatedAt:string;
    post?: string[];
    comments?:string[]
}

// Profile shapes returned by /user/get-user-profile
export interface UserProfilePost {
    id: number;
    title: string;
    content: string;
}

export interface UserProfileComment {
    id: number;
    content: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
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
    users?: string;
    createdAt?:string;
    updatedAt?:string;
    comments?:string[];
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
});



// ---- SERVICE CLASS ----
export default class BackendApi {
    // ---- TOKEN HANDLING ----
    static getAccessToken() {
        return localStorage.getItem("accessToken1");
    }

    static getRefreshToken() {
        return localStorage.getItem("refreshToken1");
    }

    static getAccessTokenExpiration(): Date | null {
        const expirationStr = localStorage.getItem("accessTokenExpiration1");
        return expirationStr ? new Date(expirationStr) : null;
    }

    static getRefreshTokenExpiration(): Date | null {
        const expirationStr = localStorage.getItem("refreshTokenExpiration1");
        return expirationStr ? new Date(expirationStr) : null;
    }

    static setTokens(
        accessToken: string,
        refreshToken: string,
        accessTokenExpiration: string,
        refreshTokenExpiration: string
    ) {
        localStorage.setItem("accessToken1", accessToken);
        localStorage.setItem("refreshToken1", refreshToken);
        localStorage.setItem("accessTokenExpiration1", accessTokenExpiration);
        localStorage.setItem("refreshTokenExpiration1", refreshTokenExpiration);
    }

    static clearTokens() {
        localStorage.removeItem("accessToken1");
        localStorage.removeItem("refreshToken1");
        localStorage.removeItem("accessTokenExpiration1");
        localStorage.removeItem("refreshTokenExpiration1");
        localStorage.removeItem("roles1");
    }

    // ---- TOKEN VALIDATION ----
    static isAccessTokenValid(): boolean {
        const expiration = this.getAccessTokenExpiration();
        if (!expiration) return false;

        const now = new Date();
        return now < expiration;
    }

    static isRefreshTokenValid(): boolean {
        const expiration = this.getRefreshTokenExpiration();
        if (!expiration) return false;

        const now = new Date();
        return now < expiration;
    }

    static getTimeUntilAccessTokenExpiration(): number {
        const expiration = this.getAccessTokenExpiration();
        if (!expiration) return 0;

        const now = new Date();
        return expiration.getTime() - now.getTime();
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
        this.setTokens(
            response.accessToken,
            response.refreshToken,
            response.accessTokenExpiration,
            response.refreshTokenExpiration
        );
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }

    static async loginUser(loginData: UserLogin) {
        const response = await this.post<AuthsResponse>("/auth/login", loginData);
        this.setTokens(
            response.accessToken,
            response.refreshToken,
            response.accessTokenExpiration,
            response.refreshTokenExpiration
        );
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }

    static async registerAdmin(adminData: UserRegistration) {
        const response = await this.post<AuthsResponse>("/auth/admin", adminData);
        this.setTokens(
            response.accessToken,
            response.refreshToken,
            response.accessTokenExpiration,
            response.refreshTokenExpiration
        );
        localStorage.setItem("roles1", JSON.stringify(response.role));
        return response;
    }



    static async logoutUser() {
        const response = await this.post<ApiResponse<any>>("/auth/logout", {});
        this.clearTokens();
        return response;
    }



    static async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await apiClient.post<AuthsResponse>(
            "/auth/refresh-token",
            { refreshToken }
        );

        // Update tokens with new expiration dates
        this.setTokens(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.accessTokenExpiration,
            response.data.refreshTokenExpiration
        );
        return response.data.accessToken;
    }

    // ---- ROLE HELPERS ----
    static getRoles(): Roles[] {
        const roles = localStorage.getItem("roles1");
        return roles ? JSON.parse(roles) : [];
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
        return !!this.getAccessToken() && this.isAccessTokenValid();
    }

    // ---- USER ----
    static async getAllUsers(page:number=0,size:number=10) {
        return this.get<PagedResponse<UserRegistration>>(`/user/list?page=${page}&size=${size}`);
    }

    static async getUserById(userId: number) {
        return this.get<UserRegistration>(`/user/get-user/${userId}`);
    }

    static async getUserProfile() {
        return this.get<ApiResponse<UserProfile>>("/user/get-user-profile");
    }

    static async getUserBookingHistoryByUserId(userId: number) {
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



}

// ---- AXIOS INTERCEPTORS ----
apiClient.interceptors.request.use(
    (config) => {
        const token = BackendApi.getAccessToken();
        if (token && BackendApi.isAccessTokenValid()) {
            config.headers.Authorization = `Bearer ${token}`;
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

            // Check if refresh token is still valid
            if (!BackendApi.isRefreshTokenValid()) {
                BackendApi.clearTokens();
                window.location.href = "/login";
                return Promise.reject(new Error("Refresh token expired"));
            }

            try {
                const newAccessToken = await BackendApi.refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                BackendApi.clearTokens();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);