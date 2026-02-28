import { LoyaltyRepository } from '../repositories/loyalty.repository.js'
import type { 
  CustomerLoyaltyDTO, 
  LoyaltyLookupDTO,
  AwardStampDTO,
  RedeemRewardDTO,
  AwardStampResultDTO,
  RedeemRewardResultDTO,
  IssueCardDTO,
  IssueCardResultDTO,
  LinkCardDTO
} from '../types/loyalty.types.js'

const STAMPS_NEEDED = 10 // Stamps needed for 1 free drink

export class LoyaltyService {
  constructor(private loyaltyRepository: LoyaltyRepository) {}

  // Look up customer loyalty by identifier (including card code)
  async lookupCustomer(lookup: LoyaltyLookupDTO): Promise<CustomerLoyaltyDTO | null> {
    const loyalty = await this.loyaltyRepository.findByIdentifier(lookup)
    return loyalty ? this.mapToDTO(loyalty) : null
  }
  
  // Look up by card code only
  async lookupByCardCode(cardCode: string): Promise<CustomerLoyaltyDTO | null> {
    const loyalty = await this.loyaltyRepository.findByCardCode(cardCode)
    return loyalty ? this.mapToDTO(loyalty) : null
  }

  // Find or create loyalty record
  async findOrCreateCustomer(lookup: LoyaltyLookupDTO, customerName?: string): Promise<CustomerLoyaltyDTO> {
    const loyalty = await this.loyaltyRepository.findOrCreate(lookup, customerName)
    return this.mapToDTO(loyalty)
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<CustomerLoyaltyDTO | null> {
    const loyalty = await this.loyaltyRepository.findById(id)
    return loyalty ? this.mapToDTO(loyalty) : null
  }

  // Get all loyalty customers
  async getAllCustomers(): Promise<CustomerLoyaltyDTO[]> {
    const loyalties = await this.loyaltyRepository.findAll()
    return loyalties.map(l => this.mapToDTO(l))
  }

  // Award stamp when order is paid
  async awardStamp(data: AwardStampDTO): Promise<AwardStampResultDTO> {
    // First, find or create the customer loyalty record
    const lookup: LoyaltyLookupDTO = {}
    if (data.cardCode) lookup.cardCode = data.cardCode
    if (data.customerPhone) lookup.customerPhone = data.customerPhone
    if (data.customerEmail) lookup.customerEmail = data.customerEmail
    if (data.deviceId) lookup.deviceId = data.deviceId
    
    // At least one identifier is required
    if (!lookup.cardCode && !lookup.customerPhone && !lookup.customerEmail && !lookup.deviceId) {
      throw new Error('At least one customer identifier (cardCode, phone, email, or deviceId) is required')
    }
    
    // Check if stamp already awarded for this order
    const alreadyAwarded = await this.loyaltyRepository.hasStampForOrder(data.orderId)
    if (alreadyAwarded) {
      throw new Error('Stamp already awarded for this order')
    }
    
    const customer = await this.loyaltyRepository.findOrCreate(lookup, data.customerName)
    
    // Award the stamp
    const result = await this.loyaltyRepository.awardStamp(
      customer.id,
      data.orderId,
      data.orderNumber
    )
    
    return {
      success: true,
      loyalty: this.mapToDTO(result.loyalty),
      transaction: result.transaction,
      rewardUnlocked: result.rewardUnlocked,
      message: result.rewardUnlocked 
        ? '🎉 Congratulations! You earned a free drink reward!' 
        : `Stamp earned! ${result.loyalty.currentStamps}/${STAMPS_NEEDED} stamps toward next reward.`
    }
  }

  // Reverse stamp when order is cancelled/refunded
  async reverseStamp(
    orderId: string,
    orderNumber: string,
    lookup: LoyaltyLookupDTO,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    // Find the customer
    const customer = await this.loyaltyRepository.findByIdentifier(lookup)
    
    if (!customer) {
      return { success: false, message: 'Customer loyalty record not found' }
    }
    
    const result = await this.loyaltyRepository.reverseStamp(
      customer.id,
      orderId,
      orderNumber,
      notes
    )
    
    if (!result) {
      return { success: false, message: 'No stamp was awarded for this order or already reversed' }
    }
    
    return { success: true, message: 'Stamp reversed successfully' }
  }

  // Redeem a reward
  async redeemReward(data: RedeemRewardDTO): Promise<RedeemRewardResultDTO> {
    // Get customer loyalty
    const customer = await this.loyaltyRepository.findById(data.loyaltyId)
    
    if (!customer) {
      throw new Error('Customer loyalty record not found')
    }
    
    const availableRewards = customer.rewardsEarned - customer.rewardsRedeemed
    if (availableRewards <= 0) {
      throw new Error('No rewards available to redeem')
    }
    
    const result = await this.loyaltyRepository.redeemReward(
      data.loyaltyId,
      data.rewardItemId,
      data.rewardItemName,
      data.processedBy,
      data.notes
    )
    
    const updatedAvailable = result.loyalty.rewardsEarned - result.loyalty.rewardsRedeemed
    
    return {
      success: true,
      loyalty: this.mapToDTO(result.loyalty),
      transaction: result.transaction,
      message: `Free drink redeemed: ${data.rewardItemName}. ${updatedAvailable} reward(s) remaining.`
    }
  }

  // Get transaction history
  async getTransactionHistory(loyaltyId: string, limit?: number) {
    return this.loyaltyRepository.getTransactionHistory(loyaltyId, limit)
  }

  // Check stamp eligibility for order
  async canAwardStamp(orderId: string): Promise<boolean> {
    return !(await this.loyaltyRepository.hasStampForOrder(orderId))
  }

  // Get loyalty status summary for display
  async getLoyaltyStatus(lookup: LoyaltyLookupDTO): Promise<{
    found: boolean
    currentStamps: number
    stampsToNextReward: number
    availableRewards: number
    totalStamps: number
  } | null> {
    const customer = await this.loyaltyRepository.findByIdentifier(lookup)
    
    if (!customer) {
      return null
    }
    
    return {
      found: true,
      currentStamps: customer.currentStamps,
      stampsToNextReward: STAMPS_NEEDED - customer.currentStamps,
      availableRewards: customer.rewardsEarned - customer.rewardsRedeemed,
      totalStamps: customer.totalStamps
    }
  }

  // Issue a new physical loyalty card
  async issueCard(data: IssueCardDTO): Promise<IssueCardResultDTO> {
    // Check if card code already exists
    const existingCard = await this.loyaltyRepository.findByCardCode(data.cardCode)
    if (existingCard) {
      throw new Error(`Card code ${data.cardCode} is already in use`)
    }
    
    // Issue the card (may link to existing phone account)
    const result = await this.loyaltyRepository.issueCard(
      data.cardCode,
      data.customerName,
      data.customerPhone
    )
    
    const isLinked = result.transaction.type === 'CARD_LINKED'
    
    return {
      success: true,
      loyalty: this.mapToDTO(result.loyalty),
      transaction: result.transaction,
      isNewAccount: !isLinked,
      linkedToExisting: isLinked,
      message: isLinked
        ? `Card ${data.cardCode} linked to existing account with ${result.loyalty.currentStamps}/${STAMPS_NEEDED} stamps`
        : `New loyalty card ${data.cardCode} issued successfully`
    }
  }

  // Link a physical card to an existing loyalty account
  async linkCard(data: LinkCardDTO): Promise<IssueCardResultDTO> {
    // Check if card code already exists
    const existingCard = await this.loyaltyRepository.findByCardCode(data.cardCode)
    if (existingCard) {
      throw new Error(`Card code ${data.cardCode} is already in use`)
    }
    
    // Check if the target loyalty account exists
    const targetAccount = await this.loyaltyRepository.findById(data.loyaltyId)
    if (!targetAccount) {
      throw new Error('Loyalty account not found')
    }
    
    // Check if account already has a card
    if (targetAccount.cardCode) {
      throw new Error(`Account already has a card: ${targetAccount.cardCode}`)
    }
    
    // Link the card
    const result = await this.loyaltyRepository.linkCard(data.cardCode, data.loyaltyId)
    
    return {
      success: true,
      loyalty: this.mapToDTO(result.loyalty),
      transaction: result.transaction,
      isNewAccount: false,
      linkedToExisting: true,
      message: `Card ${data.cardCode} linked to account successfully`
    }
  }

  // Map database entity to DTO
  private mapToDTO(loyalty: any): CustomerLoyaltyDTO {
    return {
      id: loyalty.id,
      customerPhone: loyalty.customerPhone,
      customerEmail: loyalty.customerEmail,
      deviceId: loyalty.deviceId,
      customerName: loyalty.customerName,
      cardCode: loyalty.cardCode,
      currentStamps: loyalty.currentStamps,
      totalStamps: loyalty.totalStamps,
      rewardsEarned: loyalty.rewardsEarned,
      rewardsRedeemed: loyalty.rewardsRedeemed,
      availableRewards: loyalty.rewardsEarned - loyalty.rewardsRedeemed,
      stampsToNextReward: STAMPS_NEEDED - loyalty.currentStamps,
      createdAt: loyalty.createdAt,
      updatedAt: loyalty.updatedAt,
      transactions: loyalty.transactions || []
    }
  }
}
