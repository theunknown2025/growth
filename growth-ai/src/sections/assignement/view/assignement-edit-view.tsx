import Link from "next/link"
import { Button } from "@/shadcn/ui/button"
import { ChevronLeft } from "lucide-react"
import { AssignmentEditForm } from "../assignement-edit-form";

type Props = {
    assignementId: string;
};

export default function AssignmentEditView({ assignementId }: Props) {
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/processing">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-purple-light/10 border-purple-light/30 hover:bg-purple-light/20"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Modify Assignment</h1>
        </div>

        <p className="text-white/70">
            Modify the assignment details. You can change the title, description, and other settings as needed.
        </p>

        <AssignmentEditForm assignementId={assignementId} />
      </div>
  )
}

