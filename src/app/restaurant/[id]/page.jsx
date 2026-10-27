import Restaurant from "@/src/components/Restaurant.jsx";
import { Suspense } from "react";
import { getParkById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const restaurant = await getParkById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__park">
      <Restaurant
        id={params.id}
        initialPark={park}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary parkId={params.id} />
        </Suspense>
      </Restaurant>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={park.numRatings} />}
      >
        <ReviewsList parkId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
