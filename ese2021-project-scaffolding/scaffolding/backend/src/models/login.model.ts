import { User } from './user.model';

export interface LoginResponse {
    user?: User;
    token?: string;
    message?: string;
}

export interface LoginRequest {
    userName: string;
    password: string;
}
