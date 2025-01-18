import React, { useState } from 'react';  // Import useState
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const LoadCalculation = ({ projectDetails, setLoadDetails, nextPage }) => {
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState(0);
  const [load, setLoad] = useState(0);

  const handlePassengerChange = (e) => {
    const passengerCount = e.target.value;
    setPassengers(passengerCount);
    setLoad(passengerCount * 75);  // Calculate load as 75kg per passenger
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadDetails({ passengers, load });  // Store load details in parent state
    navigate(nextPage);  // Navigate to Design page
  };

  return (
    <div>
      <h1>Load Calculation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Number of Passengers: </label>
          <input type="number" value={passengers} onChange={handlePassengerChange} required />
        </div>
        <div>
          <p>Total Load: {load} kg</p>
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default LoadCalculation;
