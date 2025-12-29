import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { getAllMoodSettings, getActiveMoodSettings, getMoodSettingByMood, updateMoodSetting, initializeMoodSettings, getFeedbackConfig, updateFeedbackConfig, getMoodOrderStats, getMoodAnalytics, initializeMoodOrderStats, trackMoodShown, trackMoodOrdered, recordMoodFeedback, resetMoodStats, initializeAllMoodData, getItemMoodStats, getMoodItemStats, getTopItemsForMood, getDetailedMoodAnalytics, resetAllMoodOrderStats, resetMoodOrderStatsByMood, resetAllMenuItemMoodStats, resetMenuItemMoodStatsByMood, resetAllMoodStatistics } from '../controllers/moodSettings.controller.js';
const router = Router();
// ==================== PUBLIC ROUTES (for customer app) ====================
// Get active mood settings for customer-facing features
router.get('/active', getActiveMoodSettings);
// Get feedback config (to know if feedback is enabled)
router.get('/feedback-config', getFeedbackConfig);
// Track mood shown/ordered (called from customer app)
router.post('/track/shown/:mood', trackMoodShown);
router.post('/track/ordered/:mood', trackMoodOrdered);
router.post('/track/feedback/:mood', recordMoodFeedback);
// Get top items for mood (used in recommendation system)
router.get('/items/top/:mood', getTopItemsForMood);
// ==================== PROTECTED ROUTES (Admin/Manager only) ====================
// Analytics & Stats (must come BEFORE /:mood to avoid being caught)
router.get('/stats/all', authenticate, authorize('ADMIN', 'MANAGER'), getMoodOrderStats);
router.get('/stats/analytics', authenticate, authorize('ADMIN', 'MANAGER'), getMoodAnalytics);
router.get('/stats/detailed/:mood', authenticate, authorize('ADMIN', 'MANAGER'), getDetailedMoodAnalytics);
router.get('/stats/items/:mood', authenticate, authorize('ADMIN', 'MANAGER'), getMoodItemStats);
router.get('/stats/item/:menuItemId', authenticate, authorize('ADMIN', 'MANAGER'), getItemMoodStats);
// Feedback Config update
router.put('/feedback-config/update', authenticate, authorize('ADMIN', 'MANAGER'), updateFeedbackConfig);
// Reset stats (careful!)
router.post('/stats/reset', authenticate, authorize('ADMIN'), resetMoodStats);
router.post('/stats/reset/:mood', authenticate, authorize('ADMIN'), resetMoodStats);
// Reset mood order stats (mood_order_stats table)
router.post('/reset/mood-order-stats', authenticate, authorize('ADMIN', 'MANAGER'), resetAllMoodOrderStats);
router.post('/reset/mood-order-stats/:mood', authenticate, authorize('ADMIN', 'MANAGER'), resetMoodOrderStatsByMood);
// Reset menu item mood stats (menu_item_mood_stats table)
router.post('/reset/item-mood-stats', authenticate, authorize('ADMIN', 'MANAGER'), resetAllMenuItemMoodStats);
router.post('/reset/item-mood-stats/:mood', authenticate, authorize('ADMIN', 'MANAGER'), resetMenuItemMoodStatsByMood);
// Reset ALL mood statistics (both tables)
router.post('/reset/all', authenticate, authorize('ADMIN', 'MANAGER'), resetAllMoodStatistics);
// Initialization (one-time setup)
router.post('/initialize/settings', authenticate, authorize('ADMIN'), initializeMoodSettings);
router.post('/initialize/stats', authenticate, authorize('ADMIN'), initializeMoodOrderStats);
router.post('/initialize/all', authenticate, authorize('ADMIN'), initializeAllMoodData);
// Mood Settings CRUD (parameterized routes LAST)
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getAllMoodSettings);
router.get('/:mood', authenticate, authorize('ADMIN', 'MANAGER'), getMoodSettingByMood);
router.put('/:mood', authenticate, authorize('ADMIN', 'MANAGER'), updateMoodSetting);
export default router;
