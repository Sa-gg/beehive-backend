import { UserRole } from '../types/customers.types.js';
export class CustomersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {
            role: UserRole.CUSTOMER // Only show customers, not staff
        };
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        const customers = await this.prisma.users.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return customers;
    }
    async findById(id) {
        const customer = await this.prisma.users.findUnique({
            where: { id }
        });
        return customer;
    }
    async findByEmail(email) {
        const customer = await this.prisma.users.findUnique({
            where: { email }
        });
        return customer;
    }
    async findByCardNumber(cardNumber) {
        const customer = await this.prisma.users.findUnique({
            where: { cardNumber }
        });
        return customer;
    }
    async create(data) {
        const id = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const customer = await this.prisma.users.create({
            data: {
                id,
                email: data.email,
                password: data.password, // In production, this should be hashed
                name: data.name,
                phone: data.phone || null,
                cardNumber: data.cardNumber || null,
                role: UserRole.CUSTOMER,
                loyaltyPoints: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        return customer;
    }
    async update(id, data) {
        const customer = await this.prisma.users.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
        return customer;
    }
    async delete(id) {
        await this.prisma.users.delete({
            where: { id }
        });
    }
    async getStats() {
        const customers = await this.prisma.users.findMany({
            where: { role: UserRole.CUSTOMER }
        });
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => c.isActive).length;
        const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
        const averageLoyaltyPoints = totalCustomers > 0 ? totalLoyaltyPoints / totalCustomers : 0;
        return {
            totalCustomers,
            activeCustomers,
            totalLoyaltyPoints,
            averageLoyaltyPoints: Math.round(averageLoyaltyPoints * 100) / 100
        };
    }
    async updateLoyaltyPoints(id, points) {
        const customer = await this.prisma.users.update({
            where: { id },
            data: {
                loyaltyPoints: {
                    increment: points
                },
                updatedAt: new Date()
            }
        });
        return customer;
    }
}
