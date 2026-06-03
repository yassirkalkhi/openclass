import { AssignmentsView } from "@/components/workspace/assignments-view"

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{ classSlug: string }>
}) {
  const { classSlug } = await params
  return <AssignmentsView classSlug={classSlug} />
}
