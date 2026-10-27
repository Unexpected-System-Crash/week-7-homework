//imports all of the important stuff
import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

//generates fake restaurants and their reviews 
export async function generateFakeParkAndReviews() {
  const parkToAdd = 5;
  const data = [];

  for (let i = 0; i < parkToAdd; i++) {
    const parkTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this restaurant
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(parkTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.parkReviews[
            randomNumberBetween(0, randomData.parkReviews.length - 1)
          ].rating,
        text: randomData.parkReviews[
          randomNumberBetween(0, randomData.parkReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    const parkData = {
      category:
        randomData.parkCategories[
          randomNumberBetween(0, randomData.parkCategories.length - 1)
        ],
      name: randomData.parkNames[
        randomNumberBetween(0, randomData.parkNames.length - 1)
      ],
      avgRating,
      city: randomData.parkCities[
        randomNumberBetween(0, randomData.parkCities.length - 1)
      ],
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      price: randomNumberBetween(1, 4),
      photo: '../../public/park.png',
      timestamp: parkTimestamp,
    };

    data.push({
      parkData,
      ratingsData,
    });
  }
  return data;
}
