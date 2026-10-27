// This component shows restaurant metadata, and offers some actions to the user like uploading a new restaurant image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const ParkDetails = ({
  park,
  userId,
  handleParkImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={park.photo} alt={park.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleParkImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{park.name}</h2>

          <div className="park__rating">
            <ul>{renderStars(park.avgRating)}</ul>

            <span>({park.numRatings})</span>
          </div>

          <p>
            {park.category} | {park.city}
          </p>
          <p>{"$".repeat(park.price)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default ParkDetails;
