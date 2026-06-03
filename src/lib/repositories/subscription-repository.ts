import { BaseRepository } from "./base-repository"
import type { Subscription } from "@/lib/types/database"

export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor() {
    super("subscriptions")
  }

  async getByOrganizationId(organizationId: string): Promise<Subscription | null> {
    return this.queryOne("organizationId", "==", organizationId)
  }

  async getByPolarSubscriptionId(polarSubscriptionId: string): Promise<Subscription | null> {
    return this.queryOne("polarSubscriptionId", "==", polarSubscriptionId)
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    return this.queryMany("status", "==", "active")
  }

  async updateStatus(
    id: string,
    status: Subscription["status"],
    currentPeriodEnd?: string
  ): Promise<void> {
    const updateData: Partial<Subscription> = {
      status,
      updatedAt: new Date().toISOString(),
    }
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = currentPeriodEnd
    }
    await this.update(id, updateData)
  }

  async updateFeatures(
    id: string,
    videoEnabled: boolean,
    aiEnabled: boolean
  ): Promise<void> {
    await this.update(id, {
      videoFeatureEnabled: videoEnabled,
      aiFeatureEnabled: aiEnabled,
      updatedAt: new Date().toISOString(),
    })
  }
}
