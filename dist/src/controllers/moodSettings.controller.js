import { MoodSettingsRepository } from '../repositories/moodSettings.repository.js';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const moodSettingsRepository = new MoodSettingsRepository(prisma);
// Validate mood type
const isValidMoodType = (mood) => {
    const validMoods = ['HAPPY', 'ENERGETIC', 'RELAXED', 'EXCITED', 'TIRED', 'STRESSED', 'ANXIOUS', 'SAD', 'DEPRESSED', 'ANGRY'];
    return validMoods.includes(mood.toUpperCase());
};
// Helper to parse JSON fields
const parseMoodSettings = (settings) => {
    return settings.map(s => ({
        ...s,
        beneficialNutrients: s.beneficialNutrients ? JSON.parse(s.beneficialNutrients) : [],
        preferredCategories: s.preferredCategories ? JSON.parse(s.preferredCategories) : [],
        excludeCategories: s.excludeCategories ? JSON.parse(s.excludeCategories) : []
    }));
};
// ==================== MOOD SETTINGS ====================
export const getAllMoodSettings = async (_req, res) => {
    try {
        const settings = await moodSettingsRepository.getAllMoodSettings();
        res.json(parseMoodSettings(settings));
    }
    catch (error) {
        console.error('Error getting mood settings:', error);
        res.status(500).json({ error: 'Failed to get mood settings' });
    }
};
export const getActiveMoodSettings = async (_req, res) => {
    try {
        const settings = await moodSettingsRepository.getActiveMoodSettings();
        res.json(parseMoodSettings(settings));
    }
    catch (error) {
        console.error('Error getting active mood settings:', error);
        res.status(500).json({ error: 'Failed to get active mood settings' });
    }
};
export const getMoodSettingByMood = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const setting = await moodSettingsRepository.getMoodSettingByMood(mood.toUpperCase());
        if (!setting) {
            return res.status(404).json({ error: 'Mood setting not found' });
        }
        res.json({
            ...setting,
            beneficialNutrients: setting.beneficialNutrients ? JSON.parse(setting.beneficialNutrients) : [],
            preferredCategories: setting.preferredCategories ? JSON.parse(setting.preferredCategories) : [],
            excludeCategories: setting.excludeCategories ? JSON.parse(setting.excludeCategories) : []
        });
    }
    catch (error) {
        console.error('Error getting mood setting:', error);
        res.status(500).json({ error: 'Failed to get mood setting' });
    }
};
export const updateMoodSetting = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const updated = await moodSettingsRepository.updateMoodSetting(mood.toUpperCase(), req.body);
        res.json({
            ...updated,
            beneficialNutrients: updated.beneficialNutrients ? JSON.parse(updated.beneficialNutrients) : [],
            preferredCategories: updated.preferredCategories ? JSON.parse(updated.preferredCategories) : [],
            excludeCategories: updated.excludeCategories ? JSON.parse(updated.excludeCategories) : []
        });
    }
    catch (error) {
        console.error('Error updating mood setting:', error);
        res.status(500).json({ error: 'Failed to update mood setting' });
    }
};
export const initializeMoodSettings = async (_req, res) => {
    try {
        const result = await moodSettingsRepository.initializeDefaultMoodSettings();
        res.json(result);
    }
    catch (error) {
        console.error('Error initializing mood settings:', error);
        res.status(500).json({ error: 'Failed to initialize mood settings' });
    }
};
// ==================== FEEDBACK CONFIG ====================
export const getFeedbackConfig = async (_req, res) => {
    try {
        const config = await moodSettingsRepository.getFeedbackConfig();
        res.json(config);
    }
    catch (error) {
        console.error('Error getting feedback config:', error);
        res.status(500).json({ error: 'Failed to get feedback config' });
    }
};
export const updateFeedbackConfig = async (req, res) => {
    try {
        const config = await moodSettingsRepository.updateFeedbackConfig(req.body);
        res.json(config);
    }
    catch (error) {
        console.error('Error updating feedback config:', error);
        res.status(500).json({ error: 'Failed to update feedback config' });
    }
};
// ==================== MOOD ORDER STATS ====================
export const getMoodOrderStats = async (_req, res) => {
    try {
        const stats = await moodSettingsRepository.getAllMoodOrderStats();
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting mood order stats:', error);
        res.status(500).json({ error: 'Failed to get mood order stats' });
    }
};
export const getMoodAnalytics = async (_req, res) => {
    try {
        const analytics = await moodSettingsRepository.getMoodAnalytics();
        res.json(analytics);
    }
    catch (error) {
        console.error('Error getting mood analytics:', error);
        res.status(500).json({ error: 'Failed to get mood analytics' });
    }
};
export const initializeMoodOrderStats = async (_req, res) => {
    try {
        const result = await moodSettingsRepository.initializeMoodOrderStats();
        res.json(result);
    }
    catch (error) {
        console.error('Error initializing mood order stats:', error);
        res.status(500).json({ error: 'Failed to initialize mood order stats' });
    }
};
export const trackMoodShown = async (req, res) => {
    try {
        const { mood } = req.params;
        const { menuItemIds } = req.body; // Array of menu item IDs that were shown
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        // Increment overall mood stats
        const stats = await moodSettingsRepository.incrementMoodShown(mood.toUpperCase());
        // Increment per-item stats if item IDs provided
        if (menuItemIds && Array.isArray(menuItemIds) && menuItemIds.length > 0) {
            await moodSettingsRepository.incrementItemsShown(menuItemIds, mood.toUpperCase());
        }
        res.json(stats);
    }
    catch (error) {
        console.error('Error tracking mood shown:', error);
        res.status(500).json({ error: 'Failed to track mood shown' });
    }
};
export const trackMoodOrdered = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const stats = await moodSettingsRepository.incrementMoodOrdered(mood.toUpperCase());
        res.json(stats);
    }
    catch (error) {
        console.error('Error tracking mood ordered:', error);
        res.status(500).json({ error: 'Failed to track mood ordered' });
    }
};
export const recordMoodFeedback = async (req, res) => {
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
        const stats = await moodSettingsRepository.recordMoodFeedback(mood.toUpperCase(), outcome, orderId);
        res.json(stats);
    }
    catch (error) {
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
export const resetMoodStats = async (req, res) => {
    try {
        const { mood } = req.params;
        if (mood && !isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const result = await moodSettingsRepository.resetMoodOrderStats(mood ? mood.toUpperCase() : undefined);
        res.json({ message: 'Stats reset successfully', result });
    }
    catch (error) {
        console.error('Error resetting mood stats:', error);
        res.status(500).json({ error: 'Failed to reset mood stats' });
    }
};
// ==================== COMBINED INITIALIZATION ====================
export const initializeAllMoodData = async (_req, res) => {
    try {
        const settingsResult = await moodSettingsRepository.initializeDefaultMoodSettings();
        const statsResult = await moodSettingsRepository.initializeMoodOrderStats();
        const config = await moodSettingsRepository.getFeedbackConfig();
        res.json({
            settings: settingsResult,
            stats: statsResult,
            config
        });
    }
    catch (error) {
        console.error('Error initializing mood data:', error);
        res.status(500).json({ error: 'Failed to initialize mood data' });
    }
};
// ==================== PER-ITEM MOOD ANALYTICS ====================
export const getItemMoodStats = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const stats = await moodSettingsRepository.getItemMoodStats(menuItemId);
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting item mood stats:', error);
        res.status(500).json({ error: 'Failed to get item mood stats' });
    }
};
export const getMoodItemStats = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const stats = await moodSettingsRepository.getMoodItemStats(mood.toUpperCase());
        res.json(stats);
    }
    catch (error) {
        console.error('Error getting mood item stats:', error);
        res.status(500).json({ error: 'Failed to get mood item stats' });
    }
};
export const getTopItemsForMood = async (req, res) => {
    try {
        const { mood } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const items = await moodSettingsRepository.getTopItemsForMood(mood.toUpperCase(), limit);
        res.json(items);
    }
    catch (error) {
        console.error('Error getting top items for mood:', error);
        res.status(500).json({ error: 'Failed to get top items for mood' });
    }
};
export const getDetailedMoodAnalytics = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const analytics = await moodSettingsRepository.getDetailedMoodAnalytics(mood.toUpperCase());
        res.json(analytics);
    }
    catch (error) {
        console.error('Error getting detailed mood analytics:', error);
        res.status(500).json({ error: 'Failed to get detailed mood analytics' });
    }
};
// ==================== RESET FUNCTIONS ====================
export const resetAllMoodOrderStats = async (_req, res) => {
    try {
        const result = await moodSettingsRepository.resetAllMoodOrderStats();
        res.json(result);
    }
    catch (error) {
        console.error('Error resetting mood order stats:', error);
        res.status(500).json({ error: 'Failed to reset mood order stats' });
    }
};
export const resetMoodOrderStatsByMood = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const result = await moodSettingsRepository.resetMoodOrderStatsByMood(mood.toUpperCase());
        res.json(result);
    }
    catch (error) {
        console.error('Error resetting mood order stats:', error);
        res.status(500).json({ error: 'Failed to reset mood order stats' });
    }
};
export const resetAllMenuItemMoodStats = async (_req, res) => {
    try {
        const result = await moodSettingsRepository.resetAllMenuItemMoodStats();
        res.json(result);
    }
    catch (error) {
        console.error('Error resetting menu item mood stats:', error);
        res.status(500).json({ error: 'Failed to reset menu item mood stats' });
    }
};
export const resetMenuItemMoodStatsByMood = async (req, res) => {
    try {
        const { mood } = req.params;
        if (!isValidMoodType(mood)) {
            return res.status(400).json({ error: 'Invalid mood type' });
        }
        const result = await moodSettingsRepository.resetMenuItemMoodStatsByMood(mood.toUpperCase());
        res.json(result);
    }
    catch (error) {
        console.error('Error resetting menu item mood stats:', error);
        res.status(500).json({ error: 'Failed to reset menu item mood stats' });
    }
};
export const resetAllMoodStatistics = async (_req, res) => {
    try {
        const result = await moodSettingsRepository.resetAllMoodStatistics();
        res.json(result);
    }
    catch (error) {
        console.error('Error resetting all mood statistics:', error);
        res.status(500).json({ error: 'Failed to reset all mood statistics' });
    }
};
