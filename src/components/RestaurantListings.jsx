"use client";

// This components handles the restaurant listings page
// It receives data from src/app/page.jsx, such as the initial restaurants and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getParkSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const ParkItem = ({ park }) => (
  <li key={park.id}>
    <Link href={`/park/${park.id}`}>
      <ActivePark park={park} />
    </Link>
  </li>
);

const ActivePark = ({ park }) => (
  <div>
    <ImageCover photo={park.photo} name={park.name} />
    <ParkDetails park={park} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const ParkDetails = ({ park }) => (
  <div className="park__details">
    <h2>{park.name}</h2>
    <ParkRating park={park} />
    <ParkMetadata park={park} />
  </div>
);

const ParkRating = ({ park }) => (
  <div className="park__rating">
    <ul>{renderStars(park.avgRating)}</ul>
    <span>({park.numRatings})</span>
  </div>
);

const ParkMetadata = ({ park }) => (
  <div className="park__meta">
    <p>
      {park.category} | {park.city}
    </p>
    <p>{"$".repeat(park.price)}</p>
  </div>
);

export default function ParkListings({
  initialParks,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    city: searchParams.city || "",
    category: searchParams.category || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [parks, setPark] = useState(initialParks);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getParkSnapshot((data) => {
      setPark(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="parks">
        {parks.map((park) => (
          <ParkItem key={park.id} park={park} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
