export class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getStats = async (_req, res) => {
        try {
            const data = await this.dashboardService.getDashboardStats();
            res.json(data);
        }
        catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                message: 'Failed to get dashboard stats',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
