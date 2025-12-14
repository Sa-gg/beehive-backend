import { PrismaClient } from '../../generated/prisma'
import { Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters, CustomerStats, UserRole } from '../types/customers.types'

export class CustomersRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: CustomerFilters): Promise<Customer[]> {
    const where: any = {
      role: UserRole.CUSTOMER // Only show customers, not staff
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const customers = await this.prisma.users.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return customers as Customer[]
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.users.findUnique({
      where: { id }
    })

    return customer as Customer | null
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.users.findUnique({
      where: { email }
    })

    return customer as Customer | null
  }

  async findByCardNumber(cardNumber: string): Promise<Customer | null> {
    const customer = await this.prisma.users.findUnique({
      where: { cardNumber }
    })

    return customer as Customer | null
  }

  async create(data: CreateCustomerDTO): Promise<Customer> {
    const id = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
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
    })

    return customer as Customer
  }

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    const customer = await this.prisma.users.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return customer as Customer
  }

  async delete(id: string): Promise<void> {
    await this.prisma.users.delete({
      where: { id }
    })
  }

  async getStats(): Promise<CustomerStats> {
    const customers = await this.prisma.users.findMany({
      where: { role: UserRole.CUSTOMER }
    })

    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.isActive).length
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
    const averageLoyaltyPoints = totalCustomers > 0 ? totalLoyaltyPoints / totalCustomers : 0

    return {
      totalCustomers,
      activeCustomers,
      totalLoyaltyPoints,
      averageLoyaltyPoints: Math.round(averageLoyaltyPoints * 100) / 100
    }
  }

  async updateLoyaltyPoints(id: string, points: number): Promise<Customer> {
    const customer = await this.prisma.users.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points
        },
        updatedAt: new Date()
      }
    })

    return customer as Customer
  }
}
