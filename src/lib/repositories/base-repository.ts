import { assertFirestoreReady, db } from "@/lib/firebase/firebase-admin"
import { stripUndefined } from "@/lib/utils"

export class BaseRepository<T extends { id: string }> {
  constructor(protected collectionName: string) {}

  protected get collection() {
    assertFirestoreReady()
    return db.collection(this.collectionName)
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    return doc.data() as T
  }

  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get()
    return snapshot.docs.map((doc) => doc.data() as T)
  }

  async create(data: T): Promise<T> {
    await this.collection.doc(data.id).set(stripUndefined(data as Record<string, unknown>) as T)
    return data
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.collection
      .doc(id)
      .update(stripUndefined(data as Record<string, unknown>) as Partial<T>)
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }

  async exists(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get()
    return doc.exists
  }

  protected async queryOne(
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: unknown
  ): Promise<T | null> {
    const snapshot = await this.collection
      .where(field, operator, value)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return snapshot.docs[0].data() as T
  }

  protected async queryMany(
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: unknown,
    orderByField?: string,
    direction: FirebaseFirestore.OrderByDirection = "asc"
  ): Promise<T[]> {
    const snapshot = await this.collection.where(
      field,
      operator,
      value
    ).get()
    
    let items = snapshot.docs.map((doc) => doc.data() as any)
    if (orderByField) {
      items.sort((a, b) => {
        const valA = a[orderByField]
        const valB = b[orderByField]
        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1
        if (valA < valB) return direction === "asc" ? -1 : 1
        if (valA > valB) return direction === "asc" ? 1 : -1
        return 0
      })
    }
    return items as T[]
  }

  protected async queryManyMultiple(
    filters: Array<{
      field: string
      operator: FirebaseFirestore.WhereFilterOp
      value: unknown
    }>,
    orderByField?: string,
    direction: FirebaseFirestore.OrderByDirection = "asc",
    limitCount?: number
  ): Promise<T[]> {
    let query: FirebaseFirestore.Query = this.collection
    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value)
    }
    const snapshot = await query.get()
    let items = snapshot.docs.map((doc) => doc.data() as any)
    
    if (orderByField) {
      items.sort((a, b) => {
        const valA = a[orderByField]
        const valB = b[orderByField]
        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1
        if (valA < valB) return direction === "asc" ? -1 : 1
        if (valA > valB) return direction === "asc" ? 1 : -1
        return 0
      })
    }
    if (limitCount) {
      items = items.slice(0, limitCount)
    }
    return items as T[]
  }

  protected async paginate(
    field: string,
    operator: FirebaseFirestore.WhereFilterOp,
    value: unknown,
    orderByField: string,
    direction: FirebaseFirestore.OrderByDirection,
    limit: number,
    cursor?: string
  ): Promise<{ items: T[]; nextCursor: string | null }> {
    let query: FirebaseFirestore.Query = this.collection.where(field, operator, value)
    const snapshot = await query.get()
    let items = snapshot.docs.map((doc) => doc.data() as any)

    items.sort((a, b) => {
      const valA = a[orderByField]
      const valB = b[orderByField]
      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1
      if (valA < valB) return direction === "asc" ? -1 : 1
      if (valA > valB) return direction === "asc" ? 1 : -1
      return 0
    })

    let startIndex = 0
    if (cursor) {
      startIndex = items.findIndex((item) => item.id === cursor)
      if (startIndex === -1) {
        startIndex = 0
      } else {
        startIndex += 1
      }
    }

    const slicedItems = items.slice(startIndex, startIndex + limit + 1)
    const hasMore = slicedItems.length > limit
    if (hasMore) {
      slicedItems.pop()
    }

    return {
      items: slicedItems as T[],
      nextCursor: hasMore ? (slicedItems[slicedItems.length - 1] as any).id : null,
    }
  }

  async batchCreate(items: T[]): Promise<void> {
    const batch = db.batch()
    for (const item of items) {
      batch.set(this.collection.doc(item.id), item)
    }
    await batch.commit()
  }

  async batchDelete(ids: string[]): Promise<void> {
    const batch = db.batch()
    for (const id of ids) {
      batch.delete(this.collection.doc(id))
    }
    await batch.commit()
  }

  async getByIds(ids: string[]): Promise<T[]> {
    if (ids.length === 0) return []
    // Firestore 'in' queries support max 30 items
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 30) {
      chunks.push(ids.slice(i, i + 30))
    }
    const results: T[] = []
    for (const chunk of chunks) {
      const snapshot = await this.collection
        .where("id", "in", chunk)
        .get()
      results.push(...snapshot.docs.map((doc) => doc.data() as T))
    }
    return results
  }
}
