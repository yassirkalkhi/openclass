import { BaseRepository } from "./base-repository"
import type { UserPresence } from "@/lib/types/database"
import { db } from "@/lib/firebase/firebase-admin"

export class PresenceRepository extends BaseRepository<UserPresence & { id: string }> {
  constructor() {
    super("userPresence")
  }

  // Presence docs use a composite key: `${userId}_${classId}`
  private composeId(userId: string, classId: string): string {
    return `${userId}_${classId}`
  }

  async getByClassAndUser(
    classId: string,
    userId: string
  ): Promise<UserPresence | null> {
    const id = this.composeId(userId, classId)
    return this.getById(id)
  }

  async getByClass(classId: string): Promise<UserPresence[]> {
    const results = await this.queryMany("classId", "==", classId)
    return results
  }

  async getOnlineByClass(classId: string): Promise<UserPresence[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "status", operator: "==", value: "online" },
    ])
  }

  async upsert(data: UserPresence): Promise<void> {
    const id = this.composeId(data.userId, data.classId)
    await this.collection.doc(id).set(
      { ...data, id },
      { merge: true }
    )
  }

  async setOffline(userId: string, classId: string): Promise<void> {
    const id = this.composeId(userId, classId)
    await this.collection.doc(id).set(
      {
        id,
        userId,
        classId,
        status: "offline",
        lastSeenAt: new Date().toISOString(),
      },
      { merge: true }
    )
  }

  async setAllOffline(userId: string): Promise<void> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("status", "!=", "offline")
      .get()
    if (snapshot.empty) return
    const batch = db.batch()
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        status: "offline",
        lastSeenAt: new Date().toISOString(),
      })
    }
    await batch.commit()
  }
}
