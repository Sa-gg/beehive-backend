import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getAllMoodSettings,
  getActiveMoodSettings,
  getMoodSettingByMood,
  updateMoodSetting,
  initializeMoodSettings,
  getFeedbackConfig,
  updateFeedbackConfig,
  getMoodOrderStats,
  getMoodAnalytics,
  initializeMoodOrderStats,
  trackMoodShown,
  trackMoodOrdered,
  recordMoodFeedback,
  resetMoodStats,
  initializeAllMoodData
} from '../controllers/moodSettings.controller.js';

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

// ==================== PROTECTED ROUTES (Admin/Manager only) ====================

// Analytics & Stats (must come BEFORE /:mood to avoid being caught)
router.get('/stats/all', authenticate, authorize('ADMIN', 'MANAGER'), getMoodOrderStats);
router.get('/stats/analytics', authenticate, authorize('ADMIN', 'MANAGER'), getMoodAnalytics);

// Feedback Config update
router.put('/feedback-config/update', authenticate, authorize('ADMIN', 'MANAGER'), updateFeedbackConfig);

// Reset stats (careful!)
router.post('/stats/reset', authenticate, authorize('ADMIN'), resetMoodStats);
router.post('/stats/reset/:mood', authenticate, authorize('ADMIN'), resetMoodStats);

// Initialization (one-time setup)
router.post('/initialize/settings', authenticate, authorize('ADMIN'), initializeMoodSettings);
router.post('/initialize/stats', authenticate, authorize('ADMIN'), initializeMoodOrderStats);
router.post('/initialize/all', authenticate, authorize('ADMIN'), initializeAllMoodData);

// Mood Settings CRUD (parameterized routes LAST)
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getAllMoodSettings);
router.get('/:mood', authenticate, authorize('ADMIN', 'MANAGER'), getMoodSettingByMood);
router.put('/:mood', authenticate, authorize('ADMIN', 'MANAGER'), updateMoodSetting);

export default router;
