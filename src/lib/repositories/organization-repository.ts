import { BaseRepository } from "./base-repository"
import type { Organization } from "@/lib/types/database"

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super("organizations")
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    return this.queryOne("slug", "==", slug)
  }

  async getByInviteCode(code: string): Promise<Organization | null> {
    return this.queryOne("inviteCode", "==", code)
  }

  async getByOwnerId(ownerId: string): Promise<Organization[]> {
    return this.queryMany("ownerId", "==", ownerId, "createdAt", "desc")
  }

  async getPublicOrganizations(): Promise<Organization[]> {
    return this.queryMany("visibility", "==", "public", "createdAt", "desc")
  }

  async searchByName(name: string): Promise<Organization[]> {
    // Firestore prefix search
    const end = name.slice(0, -1) + String.fromCharCode(name.charCodeAt(name.length - 1) + 1)
    return this.queryManyMultiple([
      { field: "name", operator: ">=", value: name },
      { field: "name", operator: "<", value: end },
    ])
  }
}
