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
    avatar?:string;
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
    avatar?: string;
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
        avatar:string;
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
    parentId?: number | null;
    likes?: number;
    dislikes?: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationDto {
    id: number;
    userId: number;
    type: string;
    message: string;
    referenceId: number;
    isRead: boolean;
    createdAt: string;
}





export interface AuthsResponse {
    accessTokenExpiration?: string;
    refreshTokenExpiration?: string;
    role?: string[] | string;
    name?: string;
    message?: string;
    timestamp?: string;
    requestId?: string;
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
    private static refreshTokenPromise: Promise<string> | null = null;

    // ---- CSRF TOKEN HANDLING ----
    static getCsrfToken(): string | null {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    static async fetchCsrfToken(): Promise<void> {
        try {
            await apiClient.get('/csrf');
            // Verify cookie was set
            if (!this.getCsrfToken()) {
                console.warn('CSRF token not found after fetch');
            }
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
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
        if (response?.role) {
            localStorage.setItem("roles1", JSON.stringify(response.role));
        }
        return response;
    }

    static async loginUser(loginData: UserLogin) {
        const response = await this.post<AuthsResponse>('/auth/login', loginData);
        if (response?.role) {
            localStorage.setItem("roles1", JSON.stringify(response.role));
        }
        return response;
    }

    static async registerAdmin(adminData: UserRegistration) {
        const response = await this.post<AuthsResponse>("/auth/admin", adminData);
        if (response?.role) {
            localStorage.setItem("roles1", JSON.stringify(response.role));
        }
        return response;
    }



    static async logoutUser() {
        const response = await this.post<ApiResponse<any>>("/auth/logout", {});
        this.clearTokens();
        return response;
    }



    static async refreshAccessToken() {
        // Prevent multiple simultaneous refresh calls
        if (this.refreshTokenPromise) {
            return this.refreshTokenPromise;
        }

        this.refreshTokenPromise = (async () => {
            try {
                const response = await apiClient.post<any>("/auth/refresh-token", {}, {
                    headers: { 'X-Skip-Interceptor': 'true' }
                });
                // Backend returns a safe BlogResponse with role and expirations (tokens are in cookies)
                if (response?.data?.role) {
                    localStorage.setItem("roles1", JSON.stringify(response.data.role));
                }
                return response.data;
            } finally {
                this.refreshTokenPromise = null;
            }
        })();

        return this.refreshTokenPromise;
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

    static async updateUserProfile(updateData: Partial<UserRegistration>) {
        return this.put<ApiResponse<UserDto>>('/user/profile', updateData);
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

    // --- Comment replies ---
    static async replyToComment(postId: number, parentId: number, CommentData: CommentDto) {
        return this.post<ApiResponse<CommentDto>>(`/comment/${postId}/reply/${parentId}`, CommentData);
    }

    // --- Comment reactions ---
    static async likeComment(commentId: number) {
        return this.post<ApiResponse<any>>(`/comment/${commentId}/like`, {});
    }

    static async unlikeComment(commentId: number) {
        return this.delete<ApiResponse<any>>(`/comment/${commentId}/like`);
    }

    static async dislikeComment(commentId: number) {
        return this.post<ApiResponse<any>>(`/comment/${commentId}/dislike`, {});
    }

    static async undislikeComment(commentId: number) {
        return this.delete<ApiResponse<any>>(`/comment/${commentId}/dislike`);
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

    // ---- ANALYTICS ----
    static async getAdminOverviewAnalytics() {
        return this.get<ApiResponse<{ totalPosts: number; totalComments: number; totalPostLikes: number; totalCommentLikes: number; totalCommentDislikes: number; totalPostViews: number }>>(`/analytics/admin/overview`);
    }

    static async getMyOverviewAnalytics() {
        return this.get<ApiResponse<{ totalPosts: number; totalComments: number; totalPostLikes: number; totalCommentLikes: number; totalCommentDislikes: number; totalPostViews: number }>>(`/analytics/me`);
    }

    // ---- CATEGORIES ----
    static async getCategories() {
        return this.get<ApiResponse<string[]>>('/post/categories');
    }

    static async getPostsByCategory(category: string, page: number = 0, size: number = 10) {
        // encode category to safely pass in URL
        return this.get<ApiResponse<PagedResponse<PostDto>>>(`/post/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);
    }

    // ---- AI TTS ----
    // generateTts supports either a string (text) or an options object:
    // { text, gender?, tone?, rate?, alternate? }
    static async generateTts(payload: string | { text: string; gender?: string; tone?: string; rate?: number; alternate?: boolean; preset?: string }) {
        try {
            const body = typeof payload === 'string' ? { text: payload } : payload;
            const response = await apiClient.post('/ai/tts', body, { responseType: 'blob' });
            return response.data as Blob;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ---- NOTIFICATIONS ----
    static async getNotifications(page: number = 0, size: number = 10) {
        return this.get<ApiResponse<PagedResponse<NotificationDto>>>(`/notifications?page=${page}&size=${size}`);
    }

    static async getUnreadNotificationCount() {
        return this.get<ApiResponse<number>>('/notifications/unread-count');
    }

    static async markNotificationAsRead(notificationId: number) {
        return this.put<ApiResponse<void>>(`/notifications/${notificationId}/read`, {});
    }

    static async markAllNotificationsAsRead() {
        return this.put<ApiResponse<void>>('/notifications/read-all', {});
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

        // Skip interceptor for refresh token requests
        if (originalRequest.headers?.['X-Skip-Interceptor']) {
            return Promise.reject(error);
        }

        // Only handle 401 errors and prevent infinite loops
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