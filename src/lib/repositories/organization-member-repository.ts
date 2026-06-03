import { BaseRepository } from "./base-repository"
import type { OrganizationMember } from "@/lib/types/database"

export class OrganizationMemberRepository extends BaseRepository<OrganizationMember> {
  constructor() {
    super("organizationMembers")
  }

  async getByOrgAndUser(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null> {
    const results = await this.queryManyMultiple([
      { field: "organizationId", operator: "==", value: organizationId },
      { field: "userId", operator: "==", value: userId },
    ])
    return results[0] ?? null
  }

  async getByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    return this.queryMany("organizationId", "==", organizationId, "createdAt", "asc")
  }

  async getByUser(userId: string): Promise<OrganizationMember[]> {
    return this.queryMany("userId", "==", userId, "createdAt", "desc")
  }

  async getByOrgAndRole(
    organizationId: string,
    role: OrganizationMember["role"]
  ): Promise<OrganizationMember[]> {
    return this.queryManyMultiple([
      { field: "organizationId", operator: "==", value: organizationId },
      { field: "role", operator: "==", value: role },
    ])
  }

  async deleteByOrgAndUser(organizationId: string, userId: string): Promise<void> {
    const member = await this.getByOrgAndUser(organizationId, userId)
    if (member) {
      await this.delete(member.id)
    }
  }

  async countByOrganization(organizationId: string): Promise<number> {
    const snapshot = await this.collection
      .where("organizationId", "==", organizationId)
      .count()
      .get()
    return snapshot.data().count
  }
}
