import { NewspaperPage } from "@/components/NewspaperPage";
import type { CapsuleResponse } from "@/lib/capsule/types";

export function CapsulePreview({ capsule }: { capsule: CapsuleResponse }) {
  return <NewspaperPage capsule={capsule} isPreview />;
}
