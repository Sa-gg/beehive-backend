import 'dotenv/config';
import express, { Request, Response } from 'express';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Menu Items architecture layers
import { MenuItemRepository } from './src/repositories/menuItem.repository.js';
import { MenuItemService } from './src/services/menuItem.service.js';
import { MenuItemController } from './src/controllers/menuItem.controller.js';
import { createMenuItemRoutes } from './src/routes/menuItem.routes.js';

// Import Upload architecture layers
import { FileStorageRepository } from './src/repositories/fileStorage.repository.js';
import { UploadService } from './src/services/upload.service.js';
import { UploadController } from './src/controllers/upload.controller.js';
import { createUploadRoutes } from './src/routes/upload.routes.js';

// Import Order architecture layers
import { OrderRepository } from './src/repositories/order.repository.js';
import { OrderService } from './src/services/order.service.js';
import { OrderController } from './src/controllers/order.controller.js';
import { createOrderRoutes } from './src/routes/order.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL! 
});

// Create adapter and Prisma Client with adapter (Prisma 7 requirement)
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Initialize Menu Items architecture layers
const menuItemRepository = new MenuItemRepository(prisma);
const menuItemService = new MenuItemService(menuItemRepository);
const menuItemController = new MenuItemController(menuItemService);

// Initialize Upload architecture layers
const fileStorageRepository = new FileStorageRepository();
const uploadService = new UploadService(fileStorageRepository);
const uploadController = new UploadController(uploadService);

// Initialize Order architecture layers
const orderRepository = new OrderRepository(prisma);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to BEEHIVE API',
    version: '1.0.0',
    endpoints: {
      menuItems: '/api/menu-items',
      upload: '/api/upload',
      orders: '/api/orders'
    }
  });
});

// Menu Items API Routes (using layered architecture)
app.use('/api/menu-items', createMenuItemRoutes(menuItemController));

// Upload API Routes (using layered architecture)

// Order API Routes (using layered architecture)
app.use('/api/orders', createOrderRoutes(orderController));
app.use('/api/upload', createUploadRoutes(uploadController));

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 Server is running on port ' + PORT);
  console.log('📍 API Documentation:');
  console.log('   GET    /api/menu-items              - Get all menu items (with filters)');
  console.log('   GET    /api/menu-items/:id          - Get menu item by ID');
  console.log('   POST   /api/menu-items              - Create new menu item');
  console.log('   PUT    /api/menu-items/:id          - Update menu item');
  console.log('   DELETE /api/menu-items/:id          - Delete menu item');
  console.log('   PATCH  /api/menu-items/:id/availability - Toggle availability');
  console.log('   PATCH  /api/menu-items/:id/featured - Toggle featured');
  console.log('   GET    /api/menu-items/category/:category - Get by category');
  console.log('   GET    /api/menu-items/featured     - Get featured items');
  console.log('   GET    /api/menu-items/search?q=... - Search items');
  console.log('   GET    /api/menu-items/stats        - Get statistics');
  console.log('');
  console.log('   POST   /api/upload/image            - Upload image file');
  console.log('   POST   /api/upload/image-url        - Download image from URL');
  console.log('   DELETE /api/upload/image/:filename  - Delete uploaded image');
  console.log('   GET    /api/upload/image/:filename/info - Get image info');
});