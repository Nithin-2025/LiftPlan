import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Pricing from './Pages/Pricing';
import About from './Pages/About';
import Contact from './Pages/Contact';
import ProjectDetails from './Pages/ProjectDetails';
import LoadCalculation from './Pages/LoadCalculation';
import ModeOfDrive from './Pages/ModeOfDrive';
import Hydraulic from './Pages/Hydraulic';
import MRL from './Pages/MRL'; // Import MRL page
import MR from './Pages/MR'; // Import MR page
import PageNotFound from './Pages/PageNotFound';


function App() {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loadDetails, setLoadDetails] = useState(null);

  return (
    <Router>
      {/* Navbar for navigation */}
      <Navbar />

      <Routes>
        {/* Default Route to Home page */}
        <Route path="/" element={<Home />} />

        {/* Route for Pricing */}
        <Route path="/pricing" element={<Pricing />} />

        {/* Route for About */}
        <Route path="/about" element={<About />} />

        {/* Route for Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* Route for Project Details */}
        <Route 
          path="/project-details" 
          element={
            <ProjectDetails 
              setProjectDetails={setProjectDetails}
              nextPage="/load-calculation" 
            />
          } 
        />

        {/* Route for Load Calculation */}
        <Route 
          path="/load-calculation" 
          element={
            projectDetails ? (
              <LoadCalculation 
                projectDetails={projectDetails}
                setLoadDetails={setLoadDetails}
                nextPage="/mode-of-drive"
              />
            ) : (
              <Navigate to="/project-details" />
            )
          } 
        />

        {/* Route for Mode of Drive */}
        <Route 
          path="/mode-of-drive" 
          element={
            loadDetails ? (
              <ModeOfDrive nextPage="/hydraulic" />
            ) : (
              <Navigate to="/load-calculation" />
            )
          } 
        />

<Route path="/hydraulic" element={<Hydraulic />} />
        <Route path="/mrl" element={<MRL />} />
        <Route path="/mr" element={<MR />} />
        <Route path="/not-found" element={<PageNotFound />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;