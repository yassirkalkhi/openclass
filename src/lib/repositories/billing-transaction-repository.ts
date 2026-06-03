import { BaseRepository } from "./base-repository"
import type { BillingTransaction } from "@/lib/types/database"

export class BillingTransactionRepository extends BaseRepository<BillingTransaction> {
  constructor() {
    super("billingTransactions")
  }

  async getByOrganizationId(organizationId: string): Promise<BillingTransaction[]> {
    return this.queryMany("organizationId", "==", organizationId, "createdAt", "desc")
  }

  async getBySubscriptionId(subscriptionId: string): Promise<BillingTransaction[]> {
    return this.queryMany("subscriptionId", "==", subscriptionId, "createdAt", "desc")
  }

  async getByStatus(status: BillingTransaction["status"]): Promise<BillingTransaction[]> {
    return this.queryMany("status", "==", status, "createdAt", "desc")
  }
}
