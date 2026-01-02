import { PrismaClient, mood_type } from '../../generated/prisma/client.js';
import { randomUUID } from 'crypto';

export interface MoodSettingDTO {
  mood: mood_type;
  emoji: string;
  label: string;
  color: string;
  description: string;
  supportMessage?: string | null;
  scientificExplanation?: string | null;
  beneficialNutrients?: string[] | null;
  preferredCategories?: string[] | null;
  excludeCategories?: string[] | null;
  preferredCategoryPoints?: number;
  isActive?: boolean;
}

export interface MoodFeedbackConfigDTO {
  baselineThreshold?: number;
  feedbackEnabled?: boolean;
  autoEnableFeedback?: boolean;
  orderRateWeight?: number;
  feedbackRateWeight?: number;
  moodBenefitsWeight?: number;
  preferredCategoryWeight?: number;
  featuredItemWeight?: number;
  priceRangeWeight?: number;
  historicalDataWeight?: number;
  timeOfDayWeight?: number;
  explorationBonusWeight?: number;
  minimumOrdersThreshold?: number;
  excludedCategoryPenalty?: number;
  day0PositionShuffle?: boolean;
  // Time of day configuration
  morningStartHour?: number;
  morningEndHour?: number;
  afternoonEndHour?: number;
  morningCategories?: string[];
  afternoonCategories?: string[];
  eveningCategories?: string[];
  // UI settings
  showMoodReflection?: boolean;
  reflectionDelayMinutes?: number;
  showRankingNumbers?: boolean;
}

export interface MoodOrderStatsDTO {
  mood: mood_type;
  totalShown: number;
  totalOrdered: number;
  feedbackCount: number;
  moodImproved: number;
  moodSame: number;
  moodWorse: number;
  baselineReached: boolean;
}

// Default mood settings based on moodSystem.ts
const DEFAULT_MOOD_SETTINGS: MoodSettingDTO[] = [
  {
    mood: 'HAPPY',
    emoji: '😊',
    label: 'Happy',
    color: '#F9C900',
    description: 'Celebrate your joy!',
    preferredCategories: ['PIZZA', 'APPETIZER', 'SMOOTHIE'],
    scientificExplanation: 'Maintain your positive mood with foods rich in omega-3 fatty acids and B-vitamins that support dopamine and serotonin production.',
    beneficialNutrients: ['Omega-3 (DHA/EPA)', 'Vitamin B Complex', 'Tryptophan']
  },
  {
    mood: 'ENERGETIC',
    emoji: '⚡',
    label: 'Energetic',
    color: '#FF6B35',
    description: 'Keep the energy going!',
    preferredCategories: ['COLD_DRINKS', 'HOT_DRINKS', 'APPETIZER'],
    scientificExplanation: 'Sustain your energy with balanced meals containing complex carbohydrates and moderate caffeine.',
    beneficialNutrients: ['B-Vitamins', 'Iron', 'Complex Carbohydrates', 'Moderate Caffeine']
  },
  {
    mood: 'RELAXED',
    emoji: '😌',
    label: 'Relaxed',
    color: '#95E1D3',
    description: 'Enjoy the calm moment',
    preferredCategories: ['SMOOTHIE', 'HOT_DRINKS', 'PLATTER'],
    scientificExplanation: 'Enhance relaxation with foods containing magnesium and L-theanine, which promote GABA production.',
    beneficialNutrients: ['Magnesium', 'L-Theanine', 'Calcium', 'Vitamin B6']
  },
  {
    mood: 'EXCITED',
    emoji: '🎉',
    label: 'Excited',
    color: '#F38181',
    description: 'Make it extra special!',
    preferredCategories: ['PIZZA', 'VALUE_MEAL', 'COLD_DRINKS'],
    scientificExplanation: 'Celebrate with foods that support dopamine levels - the neurotransmitter of reward and pleasure.',
    beneficialNutrients: ['Tyrosine', 'Vitamin D', 'Omega-3 Fatty Acids']
  },
  {
    mood: 'TIRED',
    emoji: '😴',
    label: 'Tired',
    color: '#AA96DA',
    description: 'Recharge yourself',
    supportMessage: 'Take it easy, you deserve a break! ☕',
    preferredCategories: ['HOT_DRINKS', 'SAVERS', 'SMOOTHIE'],
    scientificExplanation: 'Combat fatigue with foods rich in iron, vitamin B12, and CoQ10 which support cellular energy production.',
    beneficialNutrients: ['Iron', 'Vitamin B12', 'Magnesium', 'CoQ10', 'Moderate Caffeine']
  },
  {
    mood: 'STRESSED',
    emoji: '😰',
    label: 'Stressed',
    color: '#FCBAD3',
    description: 'Let us help you unwind',
    supportMessage: "Deep breaths! We're here to help you feel better. 💙",
    excludeCategories: ['HOT_DRINKS'],
    preferredCategories: ['SMOOTHIE', 'PLATTER', 'SAVERS'],
    scientificExplanation: 'Reduce stress with omega-3 fatty acids which lower cortisol levels and reduce inflammation.',
    beneficialNutrients: ['Omega-3 (EPA/DHA)', 'Vitamin C', 'Magnesium', 'Complex Carbohydrates']
  },
  {
    mood: 'ANXIOUS',
    emoji: '😟',
    label: 'Anxious',
    color: '#FFFFD2',
    description: 'Find your comfort zone',
    supportMessage: "You're stronger than you think. One step at a time. 🌟",
    excludeCategories: ['COLD_DRINKS'],
    preferredCategories: ['HOT_DRINKS', 'SAVERS', 'APPETIZER'],
    scientificExplanation: 'Calm anxiety with magnesium-rich foods that regulate neurotransmitters and reduce nervous system excitability.',
    beneficialNutrients: ['Magnesium', 'Omega-3 Fatty Acids', 'L-Theanine', 'Vitamin B Complex']
  },
  {
    mood: 'SAD',
    emoji: '😢',
    label: 'Sad',
    color: '#A8DADC',
    description: 'Let us brighten your day',
    supportMessage: "It's okay to feel this way. We're here for you! 🤗",
    preferredCategories: ['SMOOTHIE', 'PIZZA', 'VALUE_MEAL'],
    scientificExplanation: 'Boost mood with tryptophan-rich foods that help produce serotonin, the "feel-good" neurotransmitter.',
    beneficialNutrients: ['Tryptophan', 'Omega-3 (EPA/DHA)', 'Vitamin D', 'Folate', 'Dark Chocolate Compounds']
  },
  {
    mood: 'DEPRESSED',
    emoji: '😔',
    label: 'Feeling Down',
    color: '#B4A7D6',
    description: 'We care about you',
    supportMessage: 'You matter. Take care of yourself, one meal at a time. 💛',
    preferredCategories: ['SMOOTHIE', 'SAVERS', 'APPETIZER'],
    scientificExplanation: 'Clinical studies show EPA and DHA omega-3 fatty acids can significantly improve depressive symptoms.',
    beneficialNutrients: ['Omega-3 (EPA/DHA)', 'Folate', 'Vitamin B12', 'Tryptophan', 'Vitamin D']
  },
  {
    mood: 'ANGRY',
    emoji: '😠',
    label: 'Angry',
    color: '#E63946',
    description: 'Cool down with us',
    supportMessage: "Take a moment for yourself. You've got this! 💪",
    preferredCategories: ['COLD_DRINKS', 'SMOOTHIE', 'APPETIZER'],
    scientificExplanation: 'Cool down with foods rich in omega-3 fatty acids which reduce inflammatory responses linked to irritability.',
    beneficialNutrients: ['Omega-3 Fatty Acids', 'Magnesium', 'Vitamin C', 'B-Vitamins']
  }
];

export class MoodSettingsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ==================== MOOD SETTINGS ====================

  async getAllMoodSettings() {
    return this.prisma.mood_settings.findMany({
      orderBy: { mood: 'asc' }
    });
  }

  async getActiveMoodSettings() {
    return this.prisma.mood_settings.findMany({
      where: { isActive: true },
      orderBy: { mood: 'asc' }
    });
  }

  async getMoodSettingByMood(mood: mood_type) {
    return this.prisma.mood_settings.findUnique({
      where: { mood }
    });
  }

  async updateMoodSetting(mood: mood_type, data: Partial<MoodSettingDTO>) {
    const updateData: any = {};
    
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.supportMessage !== undefined) updateData.supportMessage = data.supportMessage;
    if (data.scientificExplanation !== undefined) updateData.scientificExplanation = data.scientificExplanation;
    if (data.beneficialNutrients !== undefined) updateData.beneficialNutrients = JSON.stringify(data.beneficialNutrients);
    if (data.preferredCategories !== undefined) updateData.preferredCategories = JSON.stringify(data.preferredCategories);
    if (data.excludeCategories !== undefined) updateData.excludeCategories = JSON.stringify(data.excludeCategories);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    updateData.updatedAt = new Date();

    return this.prisma.mood_settings.update({
      where: { mood },
      data: updateData
    });
  }

  async initializeDefaultMoodSettings() {
    const existing = await this.prisma.mood_settings.count();
    if (existing > 0) {
      return { message: 'Mood settings already initialized', count: existing };
    }

    const created = await this.prisma.mood_settings.createMany({
      data: DEFAULT_MOOD_SETTINGS.map(setting => ({
        id: randomUUID(),
        mood: setting.mood,
        emoji: setting.emoji,
        label: setting.label,
        color: setting.color,
        description: setting.description,
        supportMessage: setting.supportMessage || null,
        scientificExplanation: setting.scientificExplanation || null,
        beneficialNutrients: setting.beneficialNutrients ? JSON.stringify(setting.beneficialNutrients) : null,
        preferredCategories: setting.preferredCategories ? JSON.stringify(setting.preferredCategories) : null,
        excludeCategories: setting.excludeCategories ? JSON.stringify(setting.excludeCategories) : null,
        isActive: true,
        updatedAt: new Date()
      }))
    });

    return { message: 'Mood settings initialized', count: created.count };
  }

  // ==================== FEEDBACK CONFIG ====================

  async getFeedbackConfig() {
    let config = await this.prisma.mood_feedback_config.findUnique({
      where: { id: 'default' }
    });

    // Initialize with defaults if not exists
    if (!config) {
      config = await this.prisma.mood_feedback_config.create({
        data: {
          id: 'default',
          updatedAt: new Date()
        }
      });
    }

    return config;
  }

  async updateFeedbackConfig(data: MoodFeedbackConfigDTO) {
    // Handle array fields - convert to JSON strings
    const processedData: any = { ...data };
    if (data.morningCategories !== undefined) {
      processedData.morningCategories = JSON.stringify(data.morningCategories);
    }
    if (data.afternoonCategories !== undefined) {
      processedData.afternoonCategories = JSON.stringify(data.afternoonCategories);
    }
    if (data.eveningCategories !== undefined) {
      processedData.eveningCategories = JSON.stringify(data.eveningCategories);
    }

    return this.prisma.mood_feedback_config.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...processedData,
        updatedAt: new Date()
      },
      update: {
        ...processedData,
        updatedAt: new Date()
      }
    });
  }

  // ==================== MOOD ORDER STATS ====================

  async getAllMoodOrderStats() {
    return this.prisma.mood_order_stats.findMany({
      orderBy: { mood: 'asc' }
    });
  }

  async getMoodOrderStats(mood: mood_type) {
    return this.prisma.mood_order_stats.findUnique({
      where: { mood }
    });
  }

  async initializeMoodOrderStats() {
    const moods: mood_type[] = [
      'HAPPY', 'ENERGETIC', 'RELAXED', 'EXCITED', 'TIRED',
      'STRESSED', 'ANXIOUS', 'SAD', 'DEPRESSED', 'ANGRY'
    ];

    const existing = await this.prisma.mood_order_stats.count();
    if (existing > 0) {
      return { message: 'Mood order stats already initialized', count: existing };
    }

    const created = await this.prisma.mood_order_stats.createMany({
      data: moods.map(mood => ({
        id: randomUUID(),
        mood,
        updatedAt: new Date()
      }))
    });

    return { message: 'Mood order stats initialized', count: created.count };
  }

  async incrementMoodShown(mood: mood_type) {
    return this.prisma.mood_order_stats.upsert({
      where: { mood },
      create: {
        id: randomUUID(),
        mood,
        totalShown: 1,
        updatedAt: new Date()
      },
      update: {
        totalShown: { increment: 1 },
        updatedAt: new Date()
      }
    });
  }

  async incrementMoodOrdered(mood: mood_type) {
    const config = await this.getFeedbackConfig();
    
    const stats = await this.prisma.mood_order_stats.upsert({
      where: { mood },
      create: {
        id: randomUUID(),
        mood,
        totalOrdered: 1,
        updatedAt: new Date()
      },
      update: {
        totalOrdered: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Check if baseline reached and auto-enable feedback
    if (!stats.baselineReached && stats.totalOrdered >= config.baselineThreshold) {
      await this.prisma.mood_order_stats.update({
        where: { mood },
        data: { baselineReached: true, updatedAt: new Date() }
      });

      // Auto-enable feedback if configured
      if (config.autoEnableFeedback && !config.feedbackEnabled) {
        const allStats = await this.getAllMoodOrderStats();
        const allBaselinesReached = allStats.every(s => s.totalOrdered >= config.baselineThreshold);
        
        if (allBaselinesReached) {
          await this.updateFeedbackConfig({ feedbackEnabled: true });
        }
      }
    }

    return stats;
  }

  async recordMoodFeedback(mood: mood_type, outcome: 'improved' | 'same' | 'worse', orderId: string) {
    // Check if feedback already given for this order
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      select: { 
        moodFeedbackGiven: true,
        order_items: {
          select: { menuItemId: true }
        }
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.moodFeedbackGiven) {
      throw new Error('Feedback already given for this order');
    }

    const incrementData: any = {
      feedbackCount: { increment: 1 },
      updatedAt: new Date()
    };

    if (outcome === 'improved') {
      incrementData.moodImproved = { increment: 1 };
    } else if (outcome === 'same') {
      incrementData.moodSame = { increment: 1 };
    } else {
      incrementData.moodWorse = { increment: 1 };
    }

    // Update mood_order_stats (aggregated per mood)
    const stats = await this.prisma.mood_order_stats.upsert({
      where: { mood },
      update: incrementData,
      create: {
        id: `mood_stat_${mood}_${Date.now()}`,
        mood,
        totalShown: 0,
        totalOrdered: 0,
        feedbackCount: 1,
        moodImproved: outcome === 'improved' ? 1 : 0,
        moodSame: outcome === 'same' ? 1 : 0,
        moodWorse: outcome === 'worse' ? 1 : 0,
        baselineReached: false,
        updatedAt: new Date()
      }
    });

    // Update menu_item_mood_stats for each item in the order
    const menuItemIds = order.order_items.map(item => item.menuItemId);
    if (menuItemIds.length > 0) {
      const itemIncrementData: any = {
        feedbackCount: { increment: 1 },
        updatedAt: new Date()
      };
      if (outcome === 'improved') {
        itemIncrementData.moodImproved = { increment: 1 };
      } else if (outcome === 'same') {
        itemIncrementData.moodSame = { increment: 1 };
      } else {
        itemIncrementData.moodWorse = { increment: 1 };
      }

      // Update feedback stats for each menu item in this order
      for (const menuItemId of menuItemIds) {
        await this.prisma.menu_item_mood_stats.upsert({
          where: {
            menuItemId_mood: { menuItemId, mood }
          },
          update: itemIncrementData,
          create: {
            id: `item_mood_${menuItemId}_${mood}_${Date.now()}`,
            menuItemId,
            mood,
            timesShown: 0,
            timesOrdered: 0,
            feedbackCount: 1,
            moodImproved: outcome === 'improved' ? 1 : 0,
            moodSame: outcome === 'same' ? 1 : 0,
            moodWorse: outcome === 'worse' ? 1 : 0,
            updatedAt: new Date()
          }
        });
      }
    }

    // Mark order as feedback given
    await this.prisma.orders.update({
      where: { id: orderId },
      data: { moodFeedbackGiven: true, updatedAt: new Date() }
    });

    return stats;
  }

  async resetMoodOrderStats(mood?: mood_type) {
    if (mood) {
      return this.prisma.mood_order_stats.update({
        where: { mood },
        data: {
          totalShown: 0,
          totalOrdered: 0,
          feedbackCount: 0,
          moodImproved: 0,
          moodSame: 0,
          moodWorse: 0,
          baselineReached: false,
          updatedAt: new Date()
        }
      });
    }

    // Reset all
    return this.prisma.mood_order_stats.updateMany({
      data: {
        totalShown: 0,
        totalOrdered: 0,
        feedbackCount: 0,
        moodImproved: 0,
        moodSame: 0,
        moodWorse: 0,
        baselineReached: false,
        updatedAt: new Date()
      }
    });
  }

  // ==================== PER-ITEM MOOD STATS ====================

  // Increment shown count for multiple items when mood recommendations are displayed
  async incrementItemsShown(menuItemIds: string[], mood: mood_type) {
    const updates = menuItemIds.map(menuItemId =>
      this.prisma.menu_item_mood_stats.upsert({
        where: { menuItemId_mood: { menuItemId, mood } },
        create: {
          id: randomUUID(),
          menuItemId,
          mood,
          timesShown: 1,
          updatedAt: new Date()
        },
        update: {
          timesShown: { increment: 1 },
          updatedAt: new Date()
        }
      })
    );

    await Promise.all(updates);
    return { message: `Shown stats incremented for ${menuItemIds.length} items` };
  }

  // Increment ordered count for multiple items when order is placed
  async incrementItemsOrdered(menuItemIds: string[], mood: mood_type) {
    const updates = menuItemIds.map(menuItemId =>
      this.prisma.menu_item_mood_stats.upsert({
        where: { menuItemId_mood: { menuItemId, mood } },
        create: {
          id: randomUUID(),
          menuItemId,
          mood,
          timesOrdered: 1,
          updatedAt: new Date()
        },
        update: {
          timesOrdered: { increment: 1 },
          updatedAt: new Date()
        }
      })
    );

    await Promise.all(updates);
    return { message: `Ordered stats incremented for ${menuItemIds.length} items` };
  }

  // Record feedback for items in an order
  async recordItemsFeedback(menuItemIds: string[], mood: mood_type, outcome: 'improved' | 'same' | 'worse') {
    const incrementData: any = {
      feedbackCount: { increment: 1 },
      updatedAt: new Date()
    };

    if (outcome === 'improved') {
      incrementData.moodImproved = { increment: 1 };
    } else if (outcome === 'same') {
      incrementData.moodSame = { increment: 1 };
    } else {
      incrementData.moodWorse = { increment: 1 };
    }

    const updates = menuItemIds.map(menuItemId =>
      this.prisma.menu_item_mood_stats.upsert({
        where: { menuItemId_mood: { menuItemId, mood } },
        create: {
          id: randomUUID(),
          menuItemId,
          mood,
          feedbackCount: 1,
          moodImproved: outcome === 'improved' ? 1 : 0,
          moodSame: outcome === 'same' ? 1 : 0,
          moodWorse: outcome === 'worse' ? 1 : 0,
          updatedAt: new Date()
        },
        update: incrementData
      })
    );

    await Promise.all(updates);
    return { message: `Feedback recorded for ${menuItemIds.length} items` };
  }

  // Get mood stats for a specific menu item
  async getItemMoodStats(menuItemId: string) {
    return this.prisma.menu_item_mood_stats.findMany({
      where: { menuItemId },
      orderBy: { mood: 'asc' }
    });
  }

  // Get all item stats for a specific mood (includes ALL menu items, not just those with stats)
  async getMoodItemStats(mood: mood_type) {
    // Get all available menu items first
    const allMenuItems = await this.prisma.menu_items.findMany({
      where: { available: true },
      select: { id: true, name: true, category: true, price: true, image: true, featured: true, moodBenefits: true }
    });

    // Get existing mood stats for this mood
    const existingStats = await this.prisma.menu_item_mood_stats.findMany({
      where: { mood },
      include: {
        menu_items: {
          select: { id: true, name: true, category: true, price: true, image: true, featured: true, moodBenefits: true }
        }
      }
    });

    // Create a map of existing stats by menuItemId
    const statsMap = new Map(existingStats.map(s => [s.menuItemId, s]));

    // Return all menu items with their stats (or zero stats if none exist)
    return allMenuItems.map(menuItem => {
      const existingStat = statsMap.get(menuItem.id);
      if (existingStat) {
        return existingStat;
      }
      // Return a synthetic record for items without mood stats (Cold-Start items)
      return {
        id: `synthetic-${menuItem.id}-${mood}`,
        menuItemId: menuItem.id,
        mood,
        timesShown: 0,
        timesOrdered: 0,
        feedbackCount: 0,
        moodImproved: 0,
        moodSame: 0,
        moodWorse: 0,
        menu_items: menuItem
      };
    });
  }

  // Get top performing items for a mood (highest order rate)
  async getTopItemsForMood(mood: mood_type, limit: number = 10) {
    const stats = await this.prisma.menu_item_mood_stats.findMany({
      where: { 
        mood,
        timesShown: { gt: 0 }  // Only items that have been shown
      },
      include: {
        menu_items: {
          select: { id: true, name: true, category: true, price: true, image: true, available: true }
        }
      }
    });

    // Calculate order rate and sort
    const scoredStats = stats
      .filter(s => s.menu_items.available)  // Only available items
      .map(s => ({
        ...s,
        orderRate: s.timesShown > 0 ? s.timesOrdered / s.timesShown : 0,
        improvementRate: s.feedbackCount > 0 ? s.moodImproved / s.feedbackCount : 0
      }))
      .sort((a, b) => b.orderRate - a.orderRate)
      .slice(0, limit);

    return scoredStats;
  }

  // ==================== ANALYTICS ====================

  async getMoodAnalytics() {
    const stats = await this.getAllMoodOrderStats();
    const config = await this.getFeedbackConfig();

    return stats.map(stat => {
      const orderRate = stat.totalShown > 0 ? stat.totalOrdered / stat.totalShown : 0;
      const improvementRate = stat.feedbackCount > 0 ? stat.moodImproved / stat.feedbackCount : 0;
      const historicalScore = (orderRate * config.orderRateWeight) + (improvementRate * config.feedbackRateWeight);

      return {
        mood: stat.mood,
        totalShown: stat.totalShown,
        totalOrdered: stat.totalOrdered,
        orderRate: Math.round(orderRate * 100),
        feedbackCount: stat.feedbackCount,
        moodImproved: stat.moodImproved,
        moodSame: stat.moodSame,
        moodWorse: stat.moodWorse,
        improvementRate: Math.round(improvementRate * 100),
        historicalScore: Math.round(historicalScore * 100),
        baselineReached: stat.baselineReached,
        baselineProgress: Math.min(100, Math.round((stat.totalOrdered / config.baselineThreshold) * 100))
      };
    });
  }

  // Get comprehensive analytics including per-item stats
  async getDetailedMoodAnalytics(mood: mood_type) {
    const moodStats = await this.prisma.mood_order_stats.findUnique({
      where: { mood }
    });
    
    const itemStats = await this.getMoodItemStats(mood);
    const topItems = await this.getTopItemsForMood(mood, 10);
    const config = await this.getFeedbackConfig();

    const orderRate = moodStats && moodStats.totalShown > 0 
      ? moodStats.totalOrdered / moodStats.totalShown 
      : 0;
    const improvementRate = moodStats && moodStats.feedbackCount > 0 
      ? moodStats.moodImproved / moodStats.feedbackCount 
      : 0;

    return {
      mood,
      overallStats: moodStats ? {
        totalShown: moodStats.totalShown,
        totalOrdered: moodStats.totalOrdered,
        orderRate: Math.round(orderRate * 100),
        feedbackCount: moodStats.feedbackCount,
        moodImproved: moodStats.moodImproved,
        moodSame: moodStats.moodSame,
        moodWorse: moodStats.moodWorse,
        improvementRate: Math.round(improvementRate * 100),
        baselineReached: moodStats.baselineReached,
        baselineProgress: Math.min(100, Math.round((moodStats.totalOrdered / config.baselineThreshold) * 100))
      } : null,
      itemStats: itemStats.map(s => ({
        menuItem: s.menu_items,
        timesShown: s.timesShown,
        timesOrdered: s.timesOrdered,
        orderRate: s.timesShown > 0 ? Math.round((s.timesOrdered / s.timesShown) * 100) : 0,
        feedbackCount: s.feedbackCount,
        moodImproved: s.moodImproved,
        improvementRate: s.feedbackCount > 0 ? Math.round((s.moodImproved / s.feedbackCount) * 100) : 0
      })),
      topPerformingItems: topItems.map(s => ({
        menuItem: s.menu_items,
        orderRate: Math.round(s.orderRate * 100),
        improvementRate: Math.round(s.improvementRate * 100),
        timesOrdered: s.timesOrdered,
        timesShown: s.timesShown
      }))
    };
  }

  // ==================== RESET FUNCTIONS ====================

  // Reset all mood order stats (mood_order_stats table)
  async resetAllMoodOrderStats() {
    await this.prisma.mood_order_stats.updateMany({
      data: {
        totalShown: 0,
        totalOrdered: 0,
        feedbackCount: 0,
        moodImproved: 0,
        moodSame: 0,
        moodWorse: 0,
        baselineReached: false
      }
    });
    return { message: 'All mood order stats have been reset' };
  }

  // Reset mood order stats for a specific mood
  async resetMoodOrderStatsByMood(mood: mood_type) {
    await this.prisma.mood_order_stats.update({
      where: { mood },
      data: {
        totalShown: 0,
        totalOrdered: 0,
        feedbackCount: 0,
        moodImproved: 0,
        moodSame: 0,
        moodWorse: 0,
        baselineReached: false
      }
    });
    return { message: `Mood order stats for ${mood} have been reset` };
  }

  // Reset all menu item mood stats (menu_item_mood_stats table)
  async resetAllMenuItemMoodStats() {
    await this.prisma.menu_item_mood_stats.deleteMany({});
    return { message: 'All menu item mood stats have been reset' };
  }

  // Reset menu item mood stats for a specific mood
  async resetMenuItemMoodStatsByMood(mood: mood_type) {
    await this.prisma.menu_item_mood_stats.deleteMany({
      where: { mood }
    });
    return { message: `Menu item mood stats for ${mood} have been reset` };
  }

  // Reset menu item mood stats for a specific menu item
  async resetMenuItemMoodStatsByItem(menuItemId: string) {
    await this.prisma.menu_item_mood_stats.deleteMany({
      where: { menuItemId }
    });
    return { message: `Mood stats for menu item have been reset` };
  }

  // Reset ALL mood statistics (both tables)
  async resetAllMoodStatistics() {
    await Promise.all([
      this.resetAllMoodOrderStats(),
      this.resetAllMenuItemMoodStats()
    ]);
    return { message: 'All mood statistics have been reset' };
  }
}
