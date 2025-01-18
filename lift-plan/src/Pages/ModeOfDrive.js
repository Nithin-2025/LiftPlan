import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function ModeOfDrive({ nextPage }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [navigate, setNavigate] = useState(false);

  // Define routes for each mode
  const modeRoutes = {
    Hydraulic: nextPage, // Navigate to the next page
    MR: './Pages/MR',        // Define the path for MR
    MRL:  './Pages/MRL',        // Define the path for MRL
    Belt: '/not-found', // Redirect to "Page Not Found" for Belt
  };

  const handleSelect = (mode) => {
    setSelectedMode(mode);
    setNavigate(true);
  };

  // Navigate to the corresponding page
  if (navigate && selectedMode) {
    return <Navigate to={modeRoutes[selectedMode]} />;
  }

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h2>Select Mode of Drive</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button onClick={() => handleSelect('MR')}>MR</button>
        <button onClick={() => handleSelect('MRL')}>MRL</button>
        <button onClick={() => handleSelect('Hydraulic')}>Hydraulic</button>
        <button onClick={() => handleSelect('Belt')}>Belt</button>
      </div>
      {selectedMode && <p style={{ marginTop: '20px' }}>You selected: {selectedMode}</p>}
    </div>
  );
}

export default ModeOfDrive;
