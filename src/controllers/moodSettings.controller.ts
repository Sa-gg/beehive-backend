import { Request, Response } from 'express';
import { MoodSettingsRepository } from '../repositories/moodSettings.repository.js';
import { PrismaClient, mood_type } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const moodSettingsRepository = new MoodSettingsRepository(prisma);

// Validate mood type
const isValidMoodType = (mood: string): mood is mood_type => {
  const validMoods = ['HAPPY', 'ENERGETIC', 'RELAXED', 'EXCITED', 'TIRED', 'STRESSED', 'ANXIOUS', 'SAD', 'DEPRESSED', 'ANGRY'];
  return validMoods.includes(mood.toUpperCase());
};

// Helper to parse JSON fields
const parseMoodSettings = (settings: any[]) => {
  return settings.map(s => ({
    ...s,
    beneficialNutrients: s.beneficialNutrients ? JSON.parse(s.beneficialNutrients) : [],
    preferredCategories: s.preferredCategories ? JSON.parse(s.preferredCategories) : [],
    excludeCategories: s.excludeCategories ? JSON.parse(s.excludeCategories) : []
  }));
};

// ==================== MOOD SETTINGS ====================

export const getAllMoodSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await moodSettingsRepository.getAllMoodSettings();
    res.json(parseMoodSettings(settings));
  } catch (error) {
    console.error('Error getting mood settings:', error);
    res.status(500).json({ error: 'Failed to get mood settings' });
  }
};

export const getActiveMoodSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await moodSettingsRepository.getActiveMoodSettings();
    res.json(parseMoodSettings(settings));
  } catch (error) {
    console.error('Error getting active mood settings:', error);
    res.status(500).json({ error: 'Failed to get active mood settings' });
  }
};

export const getMoodSettingByMood = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const setting = await moodSettingsRepository.getMoodSettingByMood(mood.toUpperCase() as mood_type);
    
    if (!setting) {
      return res.status(404).json({ error: 'Mood setting not found' });
    }

    res.json({
      ...setting,
      beneficialNutrients: setting.beneficialNutrients ? JSON.parse(setting.beneficialNutrients) : [],
      preferredCategories: setting.preferredCategories ? JSON.parse(setting.preferredCategories) : [],
      excludeCategories: setting.excludeCategories ? JSON.parse(setting.excludeCategories) : []
    });
  } catch (error) {
    console.error('Error getting mood setting:', error);
    res.status(500).json({ error: 'Failed to get mood setting' });
  }
};

export const updateMoodSetting = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const updated = await moodSettingsRepository.updateMoodSetting(
      mood.toUpperCase() as mood_type,
      req.body
    );

    res.json({
      ...updated,
      beneficialNutrients: updated.beneficialNutrients ? JSON.parse(updated.beneficialNutrients) : [],
      preferredCategories: updated.preferredCategories ? JSON.parse(updated.preferredCategories) : [],
      excludeCategories: updated.excludeCategories ? JSON.parse(updated.excludeCategories) : []
    });
  } catch (error) {
    console.error('Error updating mood setting:', error);
    res.status(500).json({ error: 'Failed to update mood setting' });
  }
};

export const initializeMoodSettings = async (_req: Request, res: Response) => {
  try {
    const result = await moodSettingsRepository.initializeDefaultMoodSettings();
    res.json(result);
  } catch (error) {
    console.error('Error initializing mood settings:', error);
    res.status(500).json({ error: 'Failed to initialize mood settings' });
  }
};

// ==================== FEEDBACK CONFIG ====================

export const getFeedbackConfig = async (_req: Request, res: Response) => {
  try {
    const config = await moodSettingsRepository.getFeedbackConfig();
    res.json(config);
  } catch (error) {
    console.error('Error getting feedback config:', error);
    res.status(500).json({ error: 'Failed to get feedback config' });
  }
};

export const updateFeedbackConfig = async (req: Request, res: Response) => {
  try {
    const config = await moodSettingsRepository.updateFeedbackConfig(req.body);
    res.json(config);
  } catch (error) {
    console.error('Error updating feedback config:', error);
    res.status(500).json({ error: 'Failed to update feedback config' });
  }
};

// ==================== MOOD ORDER STATS ====================

export const getMoodOrderStats = async (_req: Request, res: Response) => {
  try {
    const stats = await moodSettingsRepository.getAllMoodOrderStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting mood order stats:', error);
    res.status(500).json({ error: 'Failed to get mood order stats' });
  }
};

export const getMoodAnalytics = async (_req: Request, res: Response) => {
  try {
    const analytics = await moodSettingsRepository.getMoodAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting mood analytics:', error);
    res.status(500).json({ error: 'Failed to get mood analytics' });
  }
};

export const initializeMoodOrderStats = async (_req: Request, res: Response) => {
  try {
    const result = await moodSettingsRepository.initializeMoodOrderStats();
    res.json(result);
  } catch (error) {
    console.error('Error initializing mood order stats:', error);
    res.status(500).json({ error: 'Failed to initialize mood order stats' });
  }
};

export const trackMoodShown = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    const { menuItemIds } = req.body;  // Array of menu item IDs that were shown
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    // Increment overall mood stats
    const stats = await moodSettingsRepository.incrementMoodShown(mood.toUpperCase() as mood_type);
    
    // Increment per-item stats if item IDs provided
    if (menuItemIds && Array.isArray(menuItemIds) && menuItemIds.length > 0) {
      await moodSettingsRepository.incrementItemsShown(menuItemIds, mood.toUpperCase() as mood_type);
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error tracking mood shown:', error);
    res.status(500).json({ error: 'Failed to track mood shown' });
  }
};

export const trackMoodOrdered = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const stats = await moodSettingsRepository.incrementMoodOrdered(mood.toUpperCase() as mood_type);
    res.json(stats);
  } catch (error) {
    console.error('Error tracking mood ordered:', error);
    res.status(500).json({ error: 'Failed to track mood ordered' });
  }
};

export const recordMoodFeedback = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    const { outcome, orderId } = req.body;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    if (!['improved', 'same', 'worse'].includes(outcome)) {
      return res.status(400).json({ error: 'Invalid outcome. Must be: improved, same, or worse' });
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const stats = await moodSettingsRepository.recordMoodFeedback(
      mood.toUpperCase() as mood_type,
      outcome,
      orderId
    );
    res.json(stats);
  } catch (error: any) {
    console.error('Error recording mood feedback:', error);
    if (error.message === 'Feedback already given for this order') {
      return res.status(400).json({ error: 'Feedback already given for this order' });
    }
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to record mood feedback' });
  }
};

export const resetMoodStats = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (mood && !isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const result = await moodSettingsRepository.resetMoodOrderStats(
      mood ? mood.toUpperCase() as mood_type : undefined
    );
    res.json({ message: 'Stats reset successfully', result });
  } catch (error) {
    console.error('Error resetting mood stats:', error);
    res.status(500).json({ error: 'Failed to reset mood stats' });
  }
};

// ==================== COMBINED INITIALIZATION ====================

export const initializeAllMoodData = async (_req: Request, res: Response) => {
  try {
    const settingsResult = await moodSettingsRepository.initializeDefaultMoodSettings();
    const statsResult = await moodSettingsRepository.initializeMoodOrderStats();
    const config = await moodSettingsRepository.getFeedbackConfig();
    
    res.json({
      settings: settingsResult,
      stats: statsResult,
      config
    });
  } catch (error) {
    console.error('Error initializing mood data:', error);
    res.status(500).json({ error: 'Failed to initialize mood data' });
  }
};

// ==================== PER-ITEM MOOD ANALYTICS ====================

export const getItemMoodStats = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const stats = await moodSettingsRepository.getItemMoodStats(menuItemId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting item mood stats:', error);
    res.status(500).json({ error: 'Failed to get item mood stats' });
  }
};

export const getMoodItemStats = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const stats = await moodSettingsRepository.getMoodItemStats(mood.toUpperCase() as mood_type);
    res.json(stats);
  } catch (error) {
    console.error('Error getting mood item stats:', error);
    res.status(500).json({ error: 'Failed to get mood item stats' });
  }
};

export const getTopItemsForMood = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const items = await moodSettingsRepository.getTopItemsForMood(mood.toUpperCase() as mood_type, limit);
    res.json(items);
  } catch (error) {
    console.error('Error getting top items for mood:', error);
    res.status(500).json({ error: 'Failed to get top items for mood' });
  }
};

export const getDetailedMoodAnalytics = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const analytics = await moodSettingsRepository.getDetailedMoodAnalytics(mood.toUpperCase() as mood_type);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting detailed mood analytics:', error);
    res.status(500).json({ error: 'Failed to get detailed mood analytics' });
  }
};
// ==================== RESET FUNCTIONS ====================

export const resetAllMoodOrderStats = async (_req: Request, res: Response) => {
  try {
    const result = await moodSettingsRepository.resetAllMoodOrderStats();
    res.json(result);
  } catch (error) {
    console.error('Error resetting mood order stats:', error);
    res.status(500).json({ error: 'Failed to reset mood order stats' });
  }
};

export const resetMoodOrderStatsByMood = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const result = await moodSettingsRepository.resetMoodOrderStatsByMood(mood.toUpperCase() as mood_type);
    res.json(result);
  } catch (error) {
    console.error('Error resetting mood order stats:', error);
    res.status(500).json({ error: 'Failed to reset mood order stats' });
  }
};

export const resetAllMenuItemMoodStats = async (_req: Request, res: Response) => {
  try {
    const result = await moodSettingsRepository.resetAllMenuItemMoodStats();
    res.json(result);
  } catch (error) {
    console.error('Error resetting menu item mood stats:', error);
    res.status(500).json({ error: 'Failed to reset menu item mood stats' });
  }
};

export const resetMenuItemMoodStatsByMood = async (req: Request, res: Response) => {
  try {
    const { mood } = req.params;
    
    if (!isValidMoodType(mood)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const result = await moodSettingsRepository.resetMenuItemMoodStatsByMood(mood.toUpperCase() as mood_type);
    res.json(result);
  } catch (error) {
    console.error('Error resetting menu item mood stats:', error);
    res.status(500).json({ error: 'Failed to reset menu item mood stats' });
  }
};

export const resetAllMoodStatistics = async (_req: Request, res: Response) => {
  try {
    const result = await moodSettingsRepository.resetAllMoodStatistics();
    res.json(result);
  } catch (error) {
    console.error('Error resetting all mood statistics:', error);
    res.status(500).json({ error: 'Failed to reset all mood statistics' });
  }
};

// ==================== BULK UPDATE ====================

/**
 * Bulk update multiple mood settings at once
 * Expects array of { mood, ...updateFields }
 */
export const bulkUpdateMoodSettings = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates must be a non-empty array' });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const update of updates) {
      const { mood, ...data } = update;
      
      if (!mood || !isValidMoodType(mood)) {
        errors.push({ mood, error: 'Invalid or missing mood type' });
        continue;
      }

      try {
        const updated = await moodSettingsRepository.updateMoodSetting(
          mood.toUpperCase() as mood_type,
          data
        );
        results.push({
          mood,
          success: true,
          data: {
            ...updated,
            beneficialNutrients: updated.beneficialNutrients ? JSON.parse(updated.beneficialNutrients) : [],
            preferredCategories: updated.preferredCategories ? JSON.parse(updated.preferredCategories) : [],
            excludeCategories: updated.excludeCategories ? JSON.parse(updated.excludeCategories) : []
          }
        });
      } catch (err: any) {
        errors.push({ mood, error: err.message });
      }
    }

    res.json({
      success: true,
      updated: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error bulk updating mood settings:', error);
    res.status(500).json({ error: 'Failed to bulk update mood settings' });
  }
};