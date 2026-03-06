import { Roles } from "../enums/Roles";

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

export interface UserDto {
    id?: number;
    name: string;
    email: string;
    description?: string;
    avatar?: string;
    roles: Roles[];
    createdAt: string;
    updatedAt: string;
    post?: string[];
    comments?: string[];
    likes?: number;
    views?: number;
}

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

export interface PostDto {
    id?: number;
    title: string;
    content: string;
    category?: string;
    user?: {
        avatar: string;
        id: number;
        name: string;
        email: string;
        description?: string;
        role: string;
    };
    users?: string;
    createdAt?: string;
    updatedAt?: string;
    comments?: string[];
    likes?: number;
    views?: number;
    downloads?: number;
    isLiked?: boolean;
    isSaved?: boolean;
}

export interface CommentDto {
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

export interface PostReportDto {
    id: number;
    postId: number;
    postTitle: string;
    reporterId: number;
    reporterName: string;
    reason: string;
    createdAt: string;
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

export interface HighlightDto {
    id: number;
    postId: number;
    selectedText: string;
    note?: string;
    startOffset: number;
    endOffset: number;
    color?: string;
    createdAt: string;
}

export interface HighlightRequest {
    selectedText: string;
    note?: string;
    startOffset: number;
    endOffset: number;
    color?: string;
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
