import { Request, Response, NextFunction } from 'express'
import { LoyaltyService } from '../services/loyalty.service.js'
import type { LoyaltyLookupDTO, AwardStampDTO, RedeemRewardDTO } from '../types/loyalty.types.js'

export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  // Look up customer by phone, email, or deviceId
  lookupCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, email, deviceId } = req.query
      
      if (!phone && !email && !deviceId) {
        return res.status(400).json({
          success: false,
          error: 'At least one identifier (phone, email, or deviceId) is required'
        })
      }
      
      const lookup: LoyaltyLookupDTO = {
        customerPhone: phone as string,
        customerEmail: email as string,
        deviceId: deviceId as string
      }
      
      const customer = await this.loyaltyService.lookupCustomer(lookup)
      
      if (!customer) {
        return res.json({ success: true, found: false, customer: null })
      }
      
      res.json({ success: true, found: true, customer })
    } catch (error) {
      next(error)
    }
  }

  // Get or create customer loyalty record
  findOrCreateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerPhone, customerEmail, deviceId, customerName } = req.body
      
      if (!customerPhone && !customerEmail && !deviceId) {
        return res.status(400).json({
          success: false,
          error: 'At least one identifier (customerPhone, customerEmail, or deviceId) is required'
        })
      }
      
      const lookup: LoyaltyLookupDTO = {
        customerPhone,
        customerEmail,
        deviceId
      }
      
      const customer = await this.loyaltyService.findOrCreateCustomer(lookup, customerName)
      res.json({ success: true, customer })
    } catch (error) {
      next(error)
    }
  }

  // Get customer by ID
  getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const customer = await this.loyaltyService.getCustomerById(id)
      
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' })
      }
      
      res.json({ success: true, customer })
    } catch (error) {
      next(error)
    }
  }

  // Get all loyalty customers
  getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await this.loyaltyService.getAllCustomers()
      res.json({ success: true, customers })
    } catch (error) {
      next(error)
    }
  }

  // Award stamp for a paid order
  awardStamp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: AwardStampDTO = req.body
      
      if (!data.orderId || !data.orderNumber) {
        return res.status(400).json({
          success: false,
          error: 'orderId and orderNumber are required'
        })
      }
      
      if (!data.customerPhone && !data.customerEmail && !data.deviceId) {
        return res.status(400).json({
          success: false,
          error: 'At least one customer identifier is required'
        })
      }
      
      const result = await this.loyaltyService.awardStamp(data)
      res.json(result)
    } catch (error: any) {
      if (error.message === 'Stamp already awarded for this order') {
        return res.status(409).json({ success: false, error: error.message })
      }
      next(error)
    }
  }

  // Reverse stamp for cancelled/refunded order
  reverseStamp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, orderNumber, customerPhone, customerEmail, deviceId, notes } = req.body
      
      if (!orderId || !orderNumber) {
        return res.status(400).json({
          success: false,
          error: 'orderId and orderNumber are required'
        })
      }
      
      if (!customerPhone && !customerEmail && !deviceId) {
        return res.status(400).json({
          success: false,
          error: 'At least one customer identifier is required'
        })
      }
      
      const lookup: LoyaltyLookupDTO = { customerPhone, customerEmail, deviceId }
      const result = await this.loyaltyService.reverseStamp(orderId, orderNumber, lookup, notes)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  // Redeem a reward
  redeemReward = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RedeemRewardDTO = req.body
      
      if (!data.loyaltyId || !data.rewardItemId || !data.rewardItemName) {
        return res.status(400).json({
          success: false,
          error: 'loyaltyId, rewardItemId, and rewardItemName are required'
        })
      }
      
      const result = await this.loyaltyService.redeemReward(data)
      res.json(result)
    } catch (error: any) {
      if (error.message === 'No rewards available to redeem') {
        return res.status(400).json({ success: false, error: error.message })
      }
      if (error.message === 'Customer loyalty record not found') {
        return res.status(404).json({ success: false, error: error.message })
      }
      next(error)
    }
  }

  // Get loyalty status summary
  getLoyaltyStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, email, deviceId } = req.query
      
      if (!phone && !email && !deviceId) {
        return res.status(400).json({
          success: false,
          error: 'At least one identifier is required'
        })
      }
      
      const lookup: LoyaltyLookupDTO = {
        customerPhone: phone as string,
        customerEmail: email as string,
        deviceId: deviceId as string
      }
      
      const status = await this.loyaltyService.getLoyaltyStatus(lookup)
      
      if (!status) {
        return res.json({ success: true, found: false })
      }
      
      res.json({ success: true, ...status })
    } catch (error) {
      next(error)
    }
  }

  // Get transaction history
  getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { limit } = req.query
      
      const transactions = await this.loyaltyService.getTransactionHistory(
        id,
        limit ? parseInt(limit as string) : undefined
      )
      
      res.json({ success: true, transactions })
    } catch (error) {
      next(error)
    }
  }

  // Check if stamp can be awarded for order
  canAwardStamp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params
      const canAward = await this.loyaltyService.canAwardStamp(orderId)
      res.json({ success: true, canAward })
    } catch (error) {
      next(error)
    }
  }
}
