export class ExpensesController {
    service;
    constructor(service) {
        this.service = service;
    }
    getAllExpenses = async (req, res) => {
        try {
            const { startDate, endDate, category, frequency } = req.query;
            const expenses = await this.service.getAllExpenses({
                startDate: startDate,
                endDate: endDate,
                category: category,
                frequency: frequency
            });
            res.json(expenses);
        }
        catch (error) {
            console.error('Error fetching expenses:', error);
            res.status(500).json({
                error: 'Failed to fetch expenses',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    getExpenseById = async (req, res) => {
        try {
            const { id } = req.params;
            const expense = await this.service.getExpenseById(id);
            res.json(expense);
        }
        catch (error) {
            console.error('Error fetching expense:', error);
            const statusCode = error instanceof Error && error.message === 'Expense not found' ? 404 : 500;
            res.status(statusCode).json({
                error: 'Failed to fetch expense',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    createExpense = async (req, res) => {
        try {
            const data = req.body;
            const expense = await this.service.createExpense(data);
            res.status(201).json(expense);
        }
        catch (error) {
            console.error('Error creating expense:', error);
            res.status(400).json({
                error: 'Failed to create expense',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    updateExpense = async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const expense = await this.service.updateExpense(id, data);
            res.json(expense);
        }
        catch (error) {
            console.error('Error updating expense:', error);
            const statusCode = error instanceof Error && error.message === 'Expense not found' ? 404 : 400;
            res.status(statusCode).json({
                error: 'Failed to update expense',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    deleteExpense = async (req, res) => {
        try {
            const { id } = req.params;
            await this.service.deleteExpense(id);
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting expense:', error);
            const statusCode = error instanceof Error && error.message === 'Expense not found' ? 404 : 500;
            res.status(statusCode).json({
                error: 'Failed to delete expense',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    getExpenseSummary = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const summary = await this.service.getExpenseSummary(startDate, endDate);
            res.json(summary);
        }
        catch (error) {
            console.error('Error fetching expense summary:', error);
            res.status(500).json({
                error: 'Failed to fetch expense summary',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
