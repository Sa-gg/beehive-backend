export class DashboardService {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async getDashboardStats() {
        const stats = await this.dashboardRepository.getDashboardStats();
        return { stats };
    }
}
