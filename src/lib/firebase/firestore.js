//import all of the important stuff
import { createFakeParksAndReviews } from "@/src/lib/fakeRestaurants.js";

import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase/clientApp";

//does the restaurant thumbnail images
export async function updateParkImageReference(
  parkId,
  publicImageUrl
) {
  const parkRef = doc(collection(db, "parks"), parkId);
  if (restaurantRef) {
    await updateDoc(parkRef, { photo: publicImageUrl });
  }
}

//update the ratings
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};



//adds the reviews to a restaurant
export async function addReviewToPark(db, parkId, review) {
  if (!parkId) {
    throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    const docRef = doc(collection(db, "parks"), parkId);
    const newRatingDocument = doc(
      collection(db, `park/${parkId}/ratings`),
    );

    // corrected line
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review),
    );
  } catch (error) {
    console.error(
      "There was an error adding the rating to the restaurant",
      error,
    );
    throw error;
  }
}
//handles the query filters
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
    q = query(q, where("category", "==", category));
  }
  if (city) {
    q = query(q, where("city", "==", city));
  }
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q;
}

//gets restaurants based on the user's selected filters
export async function getParks(db = db, filters = {}) {
  let q = query(collection(db, "parks"));

  q = applyQueryFilters(q, filters);
  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}
//gets a specific restaurant's ID ##
export async function getParksById(db, parkId) {
  if (!parkId) {
    console.log("Error: Invalid ID received: ", parkId);
    return;
  }
  const docRef = doc(db, "parks", parkId);
  const docSnap = await getDoc(docRef);
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

//returns a snapshot of the restaurants
export function getParksSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "park"));
  q = applyQueryFilters(q, filters);

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    cb(results);
  });
}

//returns the restaurant IDs
export function getParkSnapshotById(parkId, cb) {
  if (!parkId) {
    console.log("Error: Invalid ID received: ", parkId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "parks", parkId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}



//gets the reviews based on restaurant IDs 
export async function getReviewsByParkId(db, parkId) {
  if (!parkId) {
    console.log("Error: Invalid parkId received: ", parkId);
    return;
  }

  const q = query(
    collection(db, "parks", parkId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

//gets a snapshot of the reviews based on restaurant IDs
export function getReviewsSnapshotByParkId(parkId, cb) {
  if (!parkId) {
    console.log("Error: Invalid parkId received: ", parkId);
    return;
  }

  const q = query(
    collection(db, "parks", parkId, "ratings"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
}

//allows the addition of a new restaurant
export async function addFakeParksAndReviews() {
  const data = await createFakeParksAndReviews();
  for (const { parkData, ratingsData } of data) {
    try {
      const docRef = await addDoc(
        collection(db, "restaurants"),
        parkData
      );

      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "parks", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
