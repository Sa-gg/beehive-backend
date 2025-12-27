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
  showMoodReflection?: boolean;
  reflectionDelayMinutes?: number;
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
    return this.prisma.mood_feedback_config.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...data,
        updatedAt: new Date()
      },
      update: {
        ...data,
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

  async recordMoodFeedback(mood: mood_type, outcome: 'improved' | 'same' | 'worse') {
    const updateData: any = {
      feedbackCount: { increment: 1 },
      updatedAt: new Date()
    };

    if (outcome === 'improved') {
      updateData.moodImproved = { increment: 1 };
    } else if (outcome === 'same') {
      updateData.moodSame = { increment: 1 };
    } else {
      updateData.moodWorse = { increment: 1 };
    }

    return this.prisma.mood_order_stats.update({
      where: { mood },
      data: updateData
    });
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
}
