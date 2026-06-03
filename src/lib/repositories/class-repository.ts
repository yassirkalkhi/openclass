import { BaseRepository } from "./base-repository"
import type { Class } from "@/lib/types/database"

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super("classes")
  }

  async getByOrganization(organizationId: string): Promise<Class[]> {
    return this.queryMany("organizationId", "==", organizationId, "createdAt", "desc")
  }

  async getBySlug(organizationId: string, slug: string): Promise<Class | null> {
    const results = await this.queryManyMultiple([
      { field: "organizationId", operator: "==", value: organizationId },
      { field: "slug", operator: "==", value: slug },
    ])
    return results[0] ?? null
  }

  async getByInviteCode(code: string): Promise<Class | null> {
    return this.queryOne("inviteCode", "==", code)
  }

  async getByOwnerId(ownerId: string): Promise<Class[]> {
    return this.queryMany("ownerId", "==", ownerId, "createdAt", "desc")
  }

  async getActiveByOrganization(organizationId: string): Promise<Class[]> {
    return this.queryManyMultiple(
      [
        { field: "organizationId", operator: "==", value: organizationId },
        { field: "archived", operator: "==", value: false },
      ],
      "createdAt",
      "desc"
    )
  }

  async getPublicByOrganization(organizationId: string): Promise<Class[]> {
    return this.queryManyMultiple(
      [
        { field: "organizationId", operator: "==", value: organizationId },
        { field: "visibility", operator: "==", value: "public" },
      ],
      "createdAt",
      "desc"
    )
  }
}
