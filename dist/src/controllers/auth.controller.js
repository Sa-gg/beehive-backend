export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(req, res) {
        try {
            const data = req.body;
            const result = await this.authService.register(data);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const data = req.body;
            const result = await this.authService.login(data);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    async getMe(req, res) {
        try {
            const userId = req.user.userId;
            const user = await this.authService.getUserById(userId);
            res.json(user);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async getAllUsers(req, res) {
        try {
            const role = req.query.role;
            const users = await this.authService.getAllUsers(role);
            res.json(users);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getUserById(req, res) {
        try {
            const user = await this.authService.getUserById(req.params.id);
            res.json(user);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async updateUser(req, res) {
        try {
            const data = req.body;
            const user = await this.authService.updateUser(req.params.id, data);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteUser(req, res) {
        try {
            await this.authService.deleteUser(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async addLoyaltyPoints(req, res) {
        try {
            const { userId, points } = req.body;
            const user = await this.authService.addLoyaltyPoints(userId, points);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Validate manager PIN for authorization
    async validateManagerPin(req, res) {
        try {
            const { pin } = req.body;
            if (!pin) {
                return res.status(400).json({ error: 'PIN is required' });
            }
            const result = await this.authService.validateManagerPin(pin);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ valid: false, error: error.message });
        }
    }
}
