import { PrismaClient } from '../../generated/prisma/client.js'
import type { 
  CreateLoyaltyDTO, 
  LoyaltyLookupDTO,
  LoyaltyTransactionType 
} from '../types/loyalty.types.js'

export class LoyaltyRepository {
  constructor(private prisma: PrismaClient) {}

  // Find customer loyalty by any identifier (including cardCode)
  async findByIdentifier(lookup: LoyaltyLookupDTO) {
    if (lookup.customerPhone) {
      return this.prisma.customer_loyalty.findUnique({
        where: { customerPhone: lookup.customerPhone },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
      })
    }
    if (lookup.customerEmail) {
      return this.prisma.customer_loyalty.findUnique({
        where: { customerEmail: lookup.customerEmail },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
      })
    }
    if (lookup.deviceId) {
      return this.prisma.customer_loyalty.findUnique({
        where: { deviceId: lookup.deviceId },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
      })
    }
    if (lookup.cardCode) {
      return this.prisma.customer_loyalty.findUnique({
        where: { cardCode: lookup.cardCode },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
      })
    }
    return null
  }
  
  // Find by card code only
  async findByCardCode(cardCode: string) {
    return this.prisma.customer_loyalty.findUnique({
      where: { cardCode },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 10 } }
    })
  }

  async findById(id: string) {
    return this.prisma.customer_loyalty.findUnique({
      where: { id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
    })
  }

  async findAll() {
    return this.prisma.customer_loyalty.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 5 } }
    })
  }

  async create(data: CreateLoyaltyDTO) {
    return this.prisma.customer_loyalty.create({
      data: {
        id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerPhone: data.customerPhone || null,
        customerEmail: data.customerEmail || null,
        deviceId: data.deviceId || null,
        cardCode: data.cardCode || null,
        customerName: data.customerName || null,
        currentStamps: 0,
        totalStamps: 0,
        rewardsEarned: 0,
        rewardsRedeemed: 0,
        updatedAt: new Date()
      }
    })
  }
  
  // Issue a physical loyalty card (creates new record, no stamp awarded)
  async issueCard(cardCode: string, customerName?: string, customerPhone?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check if card already exists
      const existing = await tx.customer_loyalty.findUnique({
        where: { cardCode }
      })
      
      if (existing) {
        throw new Error('Card code already exists')
      }
      
      // If phone provided, check if we should link to existing account
      if (customerPhone) {
        const existingByPhone = await tx.customer_loyalty.findUnique({
          where: { customerPhone }
        })
        
        if (existingByPhone) {
          // Link card to existing phone account
          const updatedLoyalty = await tx.customer_loyalty.update({
            where: { id: existingByPhone.id },
            data: {
              cardCode,
              customerName: customerName || existingByPhone.customerName,
              updatedAt: new Date()
            }
          })
          
          // Create card linked transaction
          const transaction = await tx.loyalty_transactions.create({
            data: {
              id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              customerLoyaltyId: existingByPhone.id,
              type: 'CARD_LINKED',
              stampsBefore: existingByPhone.currentStamps,
              stampsAfter: existingByPhone.currentStamps,
              stampsChange: 0,
              notes: `Physical card ${cardCode} linked to existing phone account`,
              createdAt: new Date()
            }
          })
          
          return { loyalty: updatedLoyalty, transaction, linked: true }
        }
      }
      
      // Create new loyalty record with card code
      const newLoyalty = await tx.customer_loyalty.create({
        data: {
          id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cardCode,
          customerPhone: customerPhone || null,
          customerName: customerName || null,
          currentStamps: 0,
          totalStamps: 0,
          rewardsEarned: 0,
          rewardsRedeemed: 0,
          updatedAt: new Date()
        }
      })
      
      // Create card issued transaction (no stamp awarded)
      const transaction = await tx.loyalty_transactions.create({
        data: {
          id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerLoyaltyId: newLoyalty.id,
          type: 'CARD_ISSUED',
          stampsBefore: 0,
          stampsAfter: 0,
          stampsChange: 0,
          notes: `Physical loyalty card issued: ${cardCode}`,
          createdAt: new Date()
        }
      })
      
      return { loyalty: newLoyalty, transaction, linked: false }
    })
  }
  
  // Link physical card to existing loyalty account
  async linkCard(cardCode: string, loyaltyId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Check if card code is already in use
      const cardExists = await tx.customer_loyalty.findUnique({
        where: { cardCode }
      })
      
      if (cardExists) {
        throw new Error('Card code already linked to another account')
      }
      
      // Get the target loyalty record
      const loyalty = await tx.customer_loyalty.findUnique({
        where: { id: loyaltyId }
      })
      
      if (!loyalty) {
        throw new Error('Loyalty account not found')
      }
      
      if (loyalty.cardCode) {
        throw new Error('This account already has a card linked')
      }
      
      // Update loyalty record with card code
      const updatedLoyalty = await tx.customer_loyalty.update({
        where: { id: loyaltyId },
        data: {
          cardCode,
          updatedAt: new Date()
        }
      })
      
      // Create card linked transaction
      const transaction = await tx.loyalty_transactions.create({
        data: {
          id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerLoyaltyId: loyaltyId,
          type: 'CARD_LINKED',
          stampsBefore: loyalty.currentStamps,
          stampsAfter: loyalty.currentStamps,
          stampsChange: 0,
          notes: `Physical card ${cardCode} linked to account`,
          createdAt: new Date()
        }
      })
      
      return { loyalty: updatedLoyalty, transaction }
    })
  }

  // Find or create loyalty record
  async findOrCreate(lookup: LoyaltyLookupDTO, customerName?: string) {
    let loyalty = await this.findByIdentifier(lookup)
    
    if (!loyalty) {
      const created = await this.create({
        customerPhone: lookup.customerPhone,
        customerEmail: lookup.customerEmail,
        deviceId: lookup.deviceId,
        cardCode: lookup.cardCode,
        customerName
      })
      // Re-fetch with transactions
      loyalty = await this.findById(created.id)
    }
    
    return loyalty!
  }

  // Award a stamp and create transaction
  async awardStamp(
    loyaltyId: string,
    orderId: string,
    orderNumber: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Get current loyalty record
      const loyalty = await tx.customer_loyalty.findUnique({
        where: { id: loyaltyId }
      })
      
      if (!loyalty) throw new Error('Loyalty record not found')
      
      const stampsBefore = loyalty.currentStamps
      let stampsAfter = stampsBefore + 1
      let newRewardsEarned = loyalty.rewardsEarned
      
      // Check if this completes a reward (10 stamps)
      if (stampsAfter >= 10) {
        stampsAfter = 0 // Reset stamps
        newRewardsEarned += 1
      }
      
      // Update loyalty record
      const updatedLoyalty = await tx.customer_loyalty.update({
        where: { id: loyaltyId },
        data: {
          currentStamps: stampsAfter,
          totalStamps: loyalty.totalStamps + 1,
          rewardsEarned: newRewardsEarned,
          updatedAt: new Date()
        }
      })
      
      // Create stamp earned transaction
      const transaction = await tx.loyalty_transactions.create({
        data: {
          id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerLoyaltyId: loyaltyId,
          type: 'STAMP_EARNED',
          orderId,
          orderNumber,
          stampsBefore,
          stampsAfter,
          stampsChange: 1,
          createdAt: new Date()
        }
      })
      
      // If reward was unlocked, create additional transaction
      if (newRewardsEarned > loyalty.rewardsEarned) {
        await tx.loyalty_transactions.create({
          data: {
            id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_reward`,
            customerLoyaltyId: loyaltyId,
            type: 'REWARD_UNLOCKED',
            orderId,
            orderNumber,
            stampsBefore: 9,
            stampsAfter: 0,
            stampsChange: 0,
            notes: 'Congratulations! Free drink reward unlocked!',
            createdAt: new Date()
          }
        })
      }
      
      return { loyalty: updatedLoyalty, transaction, rewardUnlocked: newRewardsEarned > loyalty.rewardsEarned }
    })
  }

  // Reverse a stamp (for cancelled/refunded orders)
  async reverseStamp(
    loyaltyId: string,
    orderId: string,
    orderNumber: string,
    notes?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Check if stamp was already awarded for this order
      const existingTransaction = await tx.loyalty_transactions.findFirst({
        where: {
          customerLoyaltyId: loyaltyId,
          orderId,
          type: 'STAMP_EARNED'
        }
      })
      
      if (!existingTransaction) {
        // No stamp was awarded for this order, nothing to reverse
        return null
      }
      
      // Check if already reversed
      const alreadyReversed = await tx.loyalty_transactions.findFirst({
        where: {
          customerLoyaltyId: loyaltyId,
          orderId,
          type: 'STAMP_REVERSED'
        }
      })
      
      if (alreadyReversed) {
        return null // Already reversed
      }
      
      // Get current loyalty record
      const loyalty = await tx.customer_loyalty.findUnique({
        where: { id: loyaltyId }
      })
      
      if (!loyalty) throw new Error('Loyalty record not found')
      
      const stampsBefore = loyalty.currentStamps
      // Handle edge case: if stamps were reset to 0 after reward, we need to restore from 9
      // But for simplicity, we just decrement (could go negative if reward was earned)
      let stampsAfter = Math.max(0, stampsBefore - 1)
      
      // Update loyalty record
      const updatedLoyalty = await tx.customer_loyalty.update({
        where: { id: loyaltyId },
        data: {
          currentStamps: stampsAfter,
          totalStamps: Math.max(0, loyalty.totalStamps - 1),
          updatedAt: new Date()
        }
      })
      
      // Create reversal transaction
      const transaction = await tx.loyalty_transactions.create({
        data: {
          id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerLoyaltyId: loyaltyId,
          type: 'STAMP_REVERSED',
          orderId,
          orderNumber,
          stampsBefore,
          stampsAfter,
          stampsChange: -1,
          notes: notes || 'Order cancelled/refunded',
          createdAt: new Date()
        }
      })
      
      return { loyalty: updatedLoyalty, transaction }
    })
  }

  // Redeem a reward
  async redeemReward(
    loyaltyId: string,
    rewardItemId: string,
    rewardItemName: string,
    processedBy?: string,
    notes?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Get current loyalty record
      const loyalty = await tx.customer_loyalty.findUnique({
        where: { id: loyaltyId }
      })
      
      if (!loyalty) throw new Error('Loyalty record not found')
      
      const availableRewards = loyalty.rewardsEarned - loyalty.rewardsRedeemed
      if (availableRewards <= 0) {
        throw new Error('No rewards available to redeem')
      }
      
      // Update loyalty record
      const updatedLoyalty = await tx.customer_loyalty.update({
        where: { id: loyaltyId },
        data: {
          rewardsRedeemed: loyalty.rewardsRedeemed + 1,
          updatedAt: new Date()
        }
      })
      
      // Create redemption transaction
      const transaction = await tx.loyalty_transactions.create({
        data: {
          id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerLoyaltyId: loyaltyId,
          type: 'REWARD_REDEEMED',
          stampsBefore: loyalty.currentStamps,
          stampsAfter: loyalty.currentStamps,
          stampsChange: 0,
          rewardItemId,
          rewardItemName,
          processedBy,
          notes: notes || `Free drink redeemed: ${rewardItemName}`,
          createdAt: new Date()
        }
      })
      
      return { loyalty: updatedLoyalty, transaction }
    })
  }

  // Get transaction history for a customer
  async getTransactionHistory(loyaltyId: string, limit: number = 50) {
    return this.prisma.loyalty_transactions.findMany({
      where: { customerLoyaltyId: loyaltyId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Check if order already has stamp awarded
  async hasStampForOrder(orderId: string) {
    const transaction = await this.prisma.loyalty_transactions.findFirst({
      where: {
        orderId,
        type: 'STAMP_EARNED'
      }
    })
    return !!transaction
  }
}
