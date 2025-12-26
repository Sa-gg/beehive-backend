export class SalesController {
    salesService;
    constructor(salesService) {
        this.salesService = salesService;
    }
    getSalesReport = async (req, res) => {
        try {
            const filters = {
                period: req.query.period,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };
            const report = await this.salesService.getSalesReport(filters);
            res.json(report);
        }
        catch (error) {
            console.error('Error fetching sales report:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to fetch sales report'
            });
        }
    };
}
