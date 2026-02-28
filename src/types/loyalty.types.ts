// Loyalty system types

export interface CustomerLoyaltyDTO {
  id: string
  customerPhone?: string | null
  customerEmail?: string | null
  deviceId?: string | null
  cardCode?: string | null      // Physical loyalty card code/QR
  customerName?: string | null
  currentStamps: number       // 0-9 (resets after reward)
  totalStamps: number         // Lifetime total
  rewardsEarned: number       // Total 10-stamp milestones
  rewardsRedeemed: number     // Rewards already used
  availableRewards: number    // rewardsEarned - rewardsRedeemed
  stampsToNextReward: number  // 10 - currentStamps
  createdAt: Date | string
  updatedAt: Date | string
  transactions?: LoyaltyTransactionDTO[]
}

export interface LoyaltyTransactionDTO {
  id: string
  customerLoyaltyId: string
  type: LoyaltyTransactionType
  orderId?: string | null
  orderNumber?: string | null
  stampsBefore: number
  stampsAfter: number
  stampsChange: number
  rewardItemId?: string | null
  rewardItemName?: string | null
  notes?: string | null
  processedBy?: string | null
  createdAt: Date | string
}

export type LoyaltyTransactionType = 
  | 'CARD_ISSUED'       // New physical card issued (no stamp)
  | 'CARD_LINKED'       // Physical card linked to existing phone account
  | 'STAMP_EARNED'      // +1 stamp from completed paid order
  | 'STAMP_REVERSED'    // -1 stamp from cancelled/refunded order
  | 'REWARD_UNLOCKED'   // Reached 10 stamps
  | 'REWARD_REDEEMED'   // Used free drink reward

export interface CreateLoyaltyDTO {
  customerPhone?: string
  customerEmail?: string
  deviceId?: string
  cardCode?: string           // Physical loyalty card code
  customerName?: string
}

export interface AwardStampDTO {
  orderId: string
  orderNumber: string
  customerPhone?: string
  customerEmail?: string
  deviceId?: string
  cardCode?: string           // Can identify by card code
  customerName?: string
}

export interface ReverseStampDTO {
  orderId: string
  orderNumber: string
  notes?: string
}

export interface RedeemRewardDTO {
  loyaltyId: string
  rewardItemId: string
  rewardItemName: string
  processedBy?: string
  notes?: string
}

export interface LoyaltyLookupDTO {
  customerPhone?: string
  customerEmail?: string
  deviceId?: string
  cardCode?: string           // Look up by physical card code
}

// Issue physical card DTO
export interface IssueCardDTO {
  cardCode: string            // Unique code printed on physical card
  customerName?: string       // Optional name
  customerPhone?: string      // Optional - link to existing phone
}

// Link physical card to existing account
export interface LinkCardDTO {
  cardCode: string
  loyaltyId: string           // Link by ID
}

// Result types for API responses
export interface AwardStampResultDTO {
  success: boolean
  loyalty: CustomerLoyaltyDTO
  transaction: any
  rewardUnlocked: boolean
  message: string
}

export interface RedeemRewardResultDTO {
  success: boolean
  loyalty: CustomerLoyaltyDTO
  transaction: any
  message: string
}

export interface IssueCardResultDTO {
  success: boolean
  loyalty: CustomerLoyaltyDTO
  transaction: any
  isNewAccount: boolean        // True if new account was created
  linkedToExisting: boolean    // True if linked to existing phone account
  message: string
}

// Constants
export const STAMPS_FOR_REWARD = 10