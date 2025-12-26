import { recipeService } from '../services/recipe.service.js';
/**
 * Add ingredient to menu item recipe
 * POST /api/recipes/ingredients
 */
export const addIngredient = async (req, res) => {
    try {
        const { menuItemId, inventoryItemId, quantity } = req.body;
        if (!menuItemId || !inventoryItemId || !quantity) {
            return res.status(400).json({
                success: false,
                error: 'menuItemId, inventoryItemId, and quantity are required',
            });
        }
        const ingredient = await recipeService.addIngredient({
            menuItemId,
            inventoryItemId,
            quantity: parseFloat(quantity),
        });
        res.status(200).json({
            success: true,
            data: ingredient,
            message: 'Ingredient added to recipe successfully',
        });
    }
    catch (error) {
        console.error('Add ingredient error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to add ingredient',
        });
    }
};
/**
 * Remove ingredient from menu item recipe
 * DELETE /api/recipes/ingredients
 */
export const removeIngredient = async (req, res) => {
    try {
        const { menuItemId, inventoryItemId } = req.body;
        if (!menuItemId || !inventoryItemId) {
            return res.status(400).json({
                success: false,
                error: 'menuItemId and inventoryItemId are required',
            });
        }
        await recipeService.removeIngredient(menuItemId, inventoryItemId);
        res.status(200).json({
            success: true,
            message: 'Ingredient removed from recipe successfully',
        });
    }
    catch (error) {
        console.error('Remove ingredient error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to remove ingredient',
        });
    }
};
/**
 * Get recipe for a menu item
 * GET /api/recipes/:menuItemId
 */
export const getRecipe = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const recipe = await recipeService.getRecipe(menuItemId);
        res.status(200).json({
            success: true,
            data: recipe,
        });
    }
    catch (error) {
        console.error('Get recipe error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get recipe',
        });
    }
};
/**
 * Get menu items using a specific ingredient
 * GET /api/recipes/ingredient/:inventoryItemId
 */
export const getMenuItemsUsingIngredient = async (req, res) => {
    try {
        const { inventoryItemId } = req.params;
        const menuItems = await recipeService.getMenuItemsUsingIngredient(inventoryItemId);
        res.status(200).json({
            success: true,
            data: menuItems,
        });
    }
    catch (error) {
        console.error('Get menu items using ingredient error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get menu items',
        });
    }
};
/**
 * Check if menu item can be prepared
 * GET /api/recipes/:menuItemId/availability
 */
export const checkAvailability = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const availability = await recipeService.checkMenuItemAvailability(menuItemId);
        res.status(200).json({
            success: true,
            data: availability,
        });
    }
    catch (error) {
        console.error('Check availability error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to check availability',
        });
    }
};
/**
 * Calculate menu item cost
 * GET /api/recipes/:menuItemId/cost
 */
export const calculateCost = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const cost = await recipeService.calculateMenuItemCost(menuItemId);
        res.status(200).json({
            success: true,
            data: { cost },
        });
    }
    catch (error) {
        console.error('Calculate cost error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to calculate cost',
        });
    }
};
/**
 * Update entire recipe (bulk update)
 * PUT /api/recipes/:menuItemId
 */
export const updateRecipe = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients)) {
            return res.status(400).json({
                success: false,
                error: 'ingredients array is required',
            });
        }
        const recipe = await recipeService.updateRecipe(menuItemId, ingredients);
        res.status(200).json({
            success: true,
            data: recipe,
            message: 'Recipe updated successfully',
        });
    }
    catch (error) {
        console.error('Update recipe error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update recipe',
        });
    }
};
/**
 * Get menu items with low stock ingredients
 * GET /api/recipes/low-stock
 */
export const getMenuItemsWithLowStock = async (req, res) => {
    try {
        const menuItems = await recipeService.getMenuItemsWithLowStockIngredients();
        res.status(200).json({
            success: true,
            data: menuItems,
        });
    }
    catch (error) {
        console.error('Get menu items with low stock error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to get menu items with low stock',
        });
    }
};
