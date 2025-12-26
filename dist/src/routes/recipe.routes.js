import { Router } from 'express';
import { addIngredient, removeIngredient, getRecipe, getMenuItemsUsingIngredient, checkAvailability, calculateCost, updateRecipe, getMenuItemsWithLowStock, } from '../controllers/recipe.controller.js';
const router = Router();
// Recipe management
router.post('/ingredients', addIngredient);
router.delete('/ingredients', removeIngredient);
router.get('/low-stock', getMenuItemsWithLowStock);
router.get('/:menuItemId', getRecipe);
router.put('/:menuItemId', updateRecipe);
router.get('/:menuItemId/availability', checkAvailability);
router.get('/:menuItemId/cost', calculateCost);
router.get('/ingredient/:inventoryItemId', getMenuItemsUsingIngredient);
export default router;
