export class DashboardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const startOfLastWeek = new Date(startOfToday);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        const startOfLastMonth = new Date(startOfToday);
        startOfLastMonth.setDate(startOfLastMonth.getDate() - 30);
        // Get today's orders
        const todayOrders = await this.prisma.orders.findMany({
            where: {
                createdAt: {
                    gte: startOfToday,
                },
                status: {
                    in: ['PENDING', 'PREPARING', 'READY', 'COMPLETED'],
                },
            },
        });
        // Get yesterday's orders for comparison
        const yesterdayOrders = await this.prisma.orders.findMany({
            where: {
                createdAt: {
                    gte: startOfYesterday,
                    lt: startOfToday,
                },
                status: {
                    in: ['PENDING', 'PREPARING', 'READY', 'COMPLETED'],
                },
            },
        });
        // Get last week's orders for comparison
        const lastWeekOrders = await this.prisma.orders.findMany({
            where: {
                createdAt: {
                    gte: startOfLastWeek,
                    lt: startOfToday,
                },
                status: {
                    in: ['PENDING', 'PREPARING', 'READY', 'COMPLETED'],
                },
            },
        });
        // Calculate total sales today
        const totalSales = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + Number(order.total), 0);
        // Calculate sales change
        const salesChange = yesterdaySales > 0
            ? ((totalSales - yesterdaySales) / yesterdaySales) * 100
            : totalSales > 0 ? 100 : 0;
        // Orders today
        const ordersToday = todayOrders.length;
        const ordersYesterday = yesterdayOrders.length;
        const ordersChange = ordersYesterday > 0
            ? ((ordersToday - ordersYesterday) / ordersYesterday) * 100
            : ordersToday > 0 ? 100 : 0;
        // Get pending orders
        const pendingOrders = await this.prisma.orders.count({
            where: {
                status: 'PENDING',
            },
        });
        // Get active customers (all customers with CUSTOMER role)
        const activeCustomers = await this.prisma.users.count({
            where: {
                role: 'CUSTOMER',
                isActive: true,
            },
        });
        // Get customers from last month for comparison (customers created before last month)
        const lastMonthCustomers = await this.prisma.users.count({
            where: {
                role: 'CUSTOMER',
                isActive: true,
                createdAt: {
                    lt: startOfLastMonth,
                },
            },
        });
        const customersChange = lastMonthCustomers > 0
            ? ((activeCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
            : activeCustomers > 0 ? 100 : 0;
        return {
            totalSales,
            ordersToday,
            activeCustomers,
            pendingOrders,
            salesChange,
            ordersChange,
            customersChange,
        };
    }
}
