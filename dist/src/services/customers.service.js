export class CustomersService {
    customersRepository;
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
    }
    async getAllCustomers(filters) {
        return await this.customersRepository.findAll(filters);
    }
    async getCustomerById(id) {
        const customer = await this.customersRepository.findById(id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    }
    async createCustomer(data) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }
        // Check if email already exists
        const existingEmail = await this.customersRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }
        // Check if card number already exists (if provided)
        if (data.cardNumber) {
            const existingCard = await this.customersRepository.findByCardNumber(data.cardNumber);
            if (existingCard) {
                throw new Error('Card number already exists');
            }
        }
        // Validate password strength
        if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        return await this.customersRepository.create(data);
    }
    async updateCustomer(id, data) {
        // Check if customer exists
        const existingCustomer = await this.customersRepository.findById(id);
        if (!existingCustomer) {
            throw new Error('Customer not found');
        }
        // Validate email format if updating email
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Invalid email format');
            }
            // Check if new email already exists
            const existingEmail = await this.customersRepository.findByEmail(data.email);
            if (existingEmail && existingEmail.id !== id) {
                throw new Error('Email already exists');
            }
        }
        // Check if new card number already exists (if provided)
        if (data.cardNumber) {
            const existingCard = await this.customersRepository.findByCardNumber(data.cardNumber);
            if (existingCard && existingCard.id !== id) {
                throw new Error('Card number already exists');
            }
        }
        return await this.customersRepository.update(id, data);
    }
    async deleteCustomer(id) {
        const customer = await this.customersRepository.findById(id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        await this.customersRepository.delete(id);
    }
    async getCustomerStats() {
        return await this.customersRepository.getStats();
    }
    async addLoyaltyPoints(id, points) {
        if (points <= 0) {
            throw new Error('Points must be greater than 0');
        }
        const customer = await this.customersRepository.findById(id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return await this.customersRepository.updateLoyaltyPoints(id, points);
    }
}
