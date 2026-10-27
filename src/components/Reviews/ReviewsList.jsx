// This component handles the list of reviews for a given restaurant

import React from "react";
import { getReviewsByParkId } from "@/src/lib/firebase/firestore.js";
import ReviewsListClient from "@/src/components/Reviews/ReviewsListClient";
import { ReviewSkeleton } from "@/src/components/Reviews/Review";
import { getFirestore } from "firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

export default async function ReviewsList({ parkId, userId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const reviews = await getReviewsByParkId(
    getFirestore(firebaseServerApp),
    parkId
  );

  return (
    <ReviewsListClient
      initialReviews={reviews}
      restaurantId={parkId}
      userId={userId}
    />
  );
}

export function ReviewsListSkeleton({ numReviews }) {
  return (
    <article>
      <ul className="reviews">
        <ul>
          {Array(numReviews)
            .fill(0)
            .map((value, index) => (
              <ReviewSkeleton key={`loading-review-${index}`} />
            ))}
        </ul>
      </ul>
    </article>
  );
}
