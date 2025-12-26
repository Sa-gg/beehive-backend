export class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return this.prisma.users.create({
            data: {
                id: userId,
                email: data.email,
                password: data.hashedPassword,
                name: data.name,
                role: data.role || 'CUSTOMER',
                phone: data.phone,
                updatedAt: new Date()
            }
        });
    }
    async findByEmail(email) {
        return this.prisma.users.findUnique({
            where: { email }
        });
    }
    async findById(id) {
        return this.prisma.users.findUnique({
            where: { id }
        });
    }
    async findByCardNumber(cardNumber) {
        return this.prisma.users.findUnique({
            where: { cardNumber }
        });
    }
    async findAll(role) {
        return this.prisma.users.findMany({
            where: role ? { role: role } : undefined,
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, data) {
        const updateData = { updatedAt: new Date() };
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.password !== undefined)
            updateData.password = data.password;
        if (data.loyaltyPoints !== undefined)
            updateData.loyaltyPoints = data.loyaltyPoints;
        if (data.cardNumber !== undefined)
            updateData.cardNumber = data.cardNumber;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        return this.prisma.users.update({
            where: { id },
            data: updateData
        });
    }
    async updateLastLogin(id) {
        return this.prisma.users.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                updatedAt: new Date()
            }
        });
    }
    async delete(id) {
        return this.prisma.users.delete({
            where: { id }
        });
    }
    async addLoyaltyPoints(userId, points) {
        const user = await this.findById(userId);
        if (!user)
            throw new Error('User not found');
        return this.prisma.users.update({
            where: { id: userId },
            data: {
                loyaltyPoints: user.loyaltyPoints + points,
                updatedAt: new Date()
            }
        });
    }
}
