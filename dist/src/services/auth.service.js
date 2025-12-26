import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export class AuthService {
    authRepository;
    jwtSecret;
    constructor(authRepository) {
        this.authRepository = authRepository;
        this.jwtSecret = process.env.JWT_SECRET || 'beehive-secret-key-change-in-production';
    }
    excludePassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    generateToken(userId, email, role) {
        return jwt.sign({ userId, email, role }, this.jwtSecret, { expiresIn: '7d' });
    }
    async register(data) {
        // Check if email already exists
        const existingUser = await this.authRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }
        // Validate password length
        if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        // Create user
        const user = await this.authRepository.create({
            ...data,
            hashedPassword
        });
        // Generate card number for customers
        if (user.role === 'CUSTOMER') {
            const cardNumber = `BH${Date.now().toString().slice(-8)}`;
            await this.authRepository.update(user.id, { cardNumber });
            user.cardNumber = cardNumber;
        }
        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: this.excludePassword(user),
            token
        };
    }
    async login(data) {
        // Find user by email
        const user = await this.authRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is inactive. Please contact support.');
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Update last login
        await this.authRepository.updateLastLogin(user.id);
        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: this.excludePassword(user),
            token
        };
    }
    async getUserById(id) {
        const user = await this.authRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.excludePassword(user);
    }
    async getAllUsers(role) {
        const users = await this.authRepository.findAll(role);
        return users.map(user => this.excludePassword(user));
    }
    async updateUser(id, data) {
        // Check if user exists
        await this.getUserById(id);
        // If updating password, hash it
        if (data.password) {
            if (data.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            data.password = await bcrypt.hash(data.password, 10);
        }
        // If updating email, check if it's already taken
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Invalid email format');
            }
            const existingUser = await this.authRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Email already in use');
            }
        }
        const updatedUser = await this.authRepository.update(id, data);
        return this.excludePassword(updatedUser);
    }
    async deleteUser(id) {
        await this.getUserById(id);
        await this.authRepository.delete(id);
    }
    async addLoyaltyPoints(userId, points) {
        if (points <= 0) {
            throw new Error('Points must be greater than 0');
        }
        const user = await this.authRepository.addLoyaltyPoints(userId, points);
        return this.excludePassword(user);
    }
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
