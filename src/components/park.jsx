"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getParkSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import ParkDetails from "@/src/components/ParkDetails.jsx";
import { updateParkImage } from "@/src/lib/firebase/storage.js";

const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

//builds the page for a specific restaurant
export default function Park({
  id,
  initialPark,
  initialUserId,
  children,
}) {
  const [parkDetails, setParkDetails] = useState(initialPark);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  async function handleParkImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateParkImage(id, image);
    setParkDetails({ ...parkDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  useEffect(() => {
    return getParkSnapshotById(id, (data) => {
      setParkDetails(data);
    });
  }, [id]);

  return (
    <>
      <ParkDetails
        park={parkDetails}
        userId={userId}
        handleParkImage={handleParkImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </ParkDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
