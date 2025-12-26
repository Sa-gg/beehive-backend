import { Router } from 'express';
export function createExpensesRoutes(controller) {
    const router = Router();
    router.get('/', controller.getAllExpenses);
    router.get('/summary', controller.getExpenseSummary);
    router.get('/:id', controller.getExpenseById);
    router.post('/', controller.createExpense);
    router.put('/:id', controller.updateExpense);
    router.delete('/:id', controller.deleteExpense);
    return router;
}
