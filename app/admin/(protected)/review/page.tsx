import { Suspense } from "react";
import { ReviewClient } from "./ReviewClient";

export default function ReviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Draft Review</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <ReviewClient />
      </Suspense>
    </div>
  );
}
