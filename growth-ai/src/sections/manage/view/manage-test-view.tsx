import { AssignmentView } from "../manage-assigenement-view"

export default function AssignmentViewPage({ params }: { params: { id: string } }) {
  console.log("Viewing assignment with ID:", params.id)

  return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Assignment Details</h1>
          <p className="text-white/70">View detailed information and analysis for assignment {params.id}</p>
        </div>
        <AssignmentView id={params.id} />
      </div>
  )
}

