export class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getAllItems = async (req, res) => {
        try {
            const filters = {
                category: req.query.category,
                status: req.query.status,
                search: req.query.search
            };
            const items = await this.inventoryService.getAllItems(filters);
            res.json(items);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    getItemById = async (req, res) => {
        try {
            const { id } = req.params;
            const item = await this.inventoryService.getItemById(id);
            if (!item) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            res.json(item);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    createItem = async (req, res) => {
        try {
            const data = req.body;
            const item = await this.inventoryService.createItem(data);
            res.status(201).json(item);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateItem = async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const item = await this.inventoryService.updateItem(id, data);
            res.json(item);
        }
        catch (error) {
            if (error.message === 'Inventory item not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    };
    deleteItem = async (req, res) => {
        try {
            const { id } = req.params;
            await this.inventoryService.deleteItem(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    updateStock = async (req, res) => {
        try {
            const { id } = req.params;
            const { stock } = req.body;
            if (stock === undefined || typeof stock !== 'number') {
                return res.status(400).json({ error: 'Stock value is required and must be a number' });
            }
            const item = await this.inventoryService.updateStock(id, stock);
            res.json(item);
        }
        catch (error) {
            if (error.message === 'Inventory item not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    };
    getStats = async (req, res) => {
        try {
            const stats = await this.inventoryService.getStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Get low-stock and out-of-stock alerts
     * GET /api/inventory/alerts
     */
    getAlerts = async (req, res) => {
        try {
            const alerts = await this.inventoryService.getAlerts();
            res.json(alerts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
