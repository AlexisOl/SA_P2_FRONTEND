export type Rol = 'ADMIN' |'ADMIN_CINE' | 'CLIENTE' | 'EMPLEADO_CINE' | 'CLIENTE_ANUNCIOS';

export interface JwtClaims {
    sub: string;
    email: string;
    rol: Rol;
    bancaVirtual: number;
    iat: number;
    exp: number;
}
export interface RegisterDTO {
    nombre: string;
    email: string;
    password: string;
    dpi: string;
    rol: Rol;
    bancaVirtual:number
}

export interface UserDTO {
    id: string;
    nombre: string;
    email: string;
    dpi: string;
    rol: Rol;
    bancaVirtual?: number;
    enabled: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
}