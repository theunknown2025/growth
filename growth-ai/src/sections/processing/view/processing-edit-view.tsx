import Link from "next/link"
import { Button } from "@/shadcn/ui/button"
import { ChevronLeft } from "lucide-react"
import { ProcessingAnswerView } from "../processing-answer-form";
import { paths } from "@/routes/paths";

type Props = {
    assignementId: string;
};

export default function ProcessingView({ assignementId }: Props) {
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href={paths.dashboard.processing.root}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-purple-light/10 border-purple-light/30 hover:bg-purple-light/20"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Finish Your Assignment</h1>
        </div>

        <p className="text-white/70">
            Finish your assignment by submitting the required documents and answering the questions. Make sure to review your answers before submitting.
        </p>

        <ProcessingAnswerView assignementId={assignementId} />
      </div>
  )
}

