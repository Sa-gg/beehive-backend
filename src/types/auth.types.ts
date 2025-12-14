export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: 'CUSTOMER' | 'CASHIER' | 'COOK' | 'MANAGER';
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  loyaltyPoints?: number;
  cardNumber?: string;
  isActive?: boolean;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'CASHIER' | 'COOK' | 'MANAGER';
  phone?: string;
  loyaltyPoints: number;
  cardNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}
