import { BaseRepository } from "./base-repository"
import type { Profile } from "@/lib/types/database"

export class ProfileRepository extends BaseRepository<Profile> {
  constructor() {
    super("profiles")
  }

  async getByEmail(email: string): Promise<Profile | null> {
    return this.queryOne("email", "==", email)
  }

  async getByEmails(emails: string[]): Promise<Profile[]> {
    if (emails.length === 0) return []
    const chunks: string[][] = []
    for (let i = 0; i < emails.length; i += 30) {
      chunks.push(emails.slice(i, i + 30))
    }
    const results: Profile[] = []
    for (const chunk of chunks) {
      const snapshot = await this.collection
        .where("email", "in", chunk)
        .get()
      results.push(...snapshot.docs.map((doc) => doc.data() as Profile))
    }
    return results
  }

  async searchByName(name: string): Promise<Profile[]> {
    const end = name.slice(0, -1) + String.fromCharCode(name.charCodeAt(name.length - 1) + 1)
    return this.queryManyMultiple([
      { field: "fullName", operator: ">=", value: name },
      { field: "fullName", operator: "<", value: end },
    ])
  }

  async addOrganizationId(userId: string, organizationId: string): Promise<void> {
    const profile = await this.getById(userId)
    if (!profile) return
    const orgIds = profile.organizationIds ?? []
    if (!orgIds.includes(organizationId)) {
      orgIds.push(organizationId)
      await this.update(userId, { organizationIds: orgIds })
    }
  }

  async removeOrganizationId(userId: string, organizationId: string): Promise<void> {
    const profile = await this.getById(userId)
    if (!profile) return
    const orgIds = (profile.organizationIds ?? []).filter((id) => id !== organizationId)
    await this.update(userId, { organizationIds: orgIds })
  }
}
