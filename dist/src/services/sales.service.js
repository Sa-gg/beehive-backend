export class SalesService {
    salesRepository;
    constructor(salesRepository) {
        this.salesRepository = salesRepository;
    }
    async getSalesReport(filters) {
        const { startDate, endDate } = this.getDateRange(filters);
        // Fetch all data in parallel
        const [metricsData, dailySales, topSellingItems, categorySales, hourlySales] = await Promise.all([
            this.salesRepository.getSalesMetrics(startDate, endDate),
            this.salesRepository.getDailySales(startDate, endDate),
            this.salesRepository.getTopSellingItems(startDate, endDate),
            this.salesRepository.getCategorySales(startDate, endDate),
            this.salesRepository.getHourlySales(startDate, endDate)
        ]);
        const { totalRevenue, totalOrders, previousRevenue } = metricsData;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const dailyAverage = totalRevenue / daysDiff;
        const revenueGrowth = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;
        return {
            metrics: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                dailyAverage,
                previousPeriodRevenue: previousRevenue,
                revenueGrowth
            },
            dailySales,
            topSellingItems,
            categorySales,
            hourlySales,
            period: {
                startDate,
                endDate,
                type: filters.period || 'custom'
            }
        };
    }
    getDateRange(filters) {
        const now = new Date();
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date(now.setHours(23, 59, 59, 999));
        let startDate;
        if (filters.period === 'today') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
        }
        else if (filters.period === 'week') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (filters.period === 'month') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (filters.startDate) {
            startDate = new Date(filters.startDate);
        }
        else {
            // Default to last 7 days
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        }
        return { startDate, endDate };
    }
}
