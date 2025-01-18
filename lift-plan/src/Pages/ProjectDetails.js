import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const ProjectDetails = ({ setProjectDetails, nextPage }) => {
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    projectNumber: '',
    projectName: '',
    clientName: '',
    projectDate: '',
  });

    // Set the current date automatically when the component loads
    useEffect(() => {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setDetails((prev) => ({ ...prev, projectDate: today }));
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProjectDetails(details);  // Store project details in parent state
    navigate(nextPage);  // Navigate to Load Calculation page
  };

  return (
    <div>
      <h1>Project Details</h1>
      <form onSubmit={handleSubmit}>
      <div>
          <label>Project Number:</label>
          <input type="text" name="projectNumber" value={details.projectNumber} onChange={handleChange} required />
        </div>
        <div>
          <label>Project Name:</label>
          <input type="text" name="projectName" value={details.projectName} onChange={handleChange} required />
        </div>
        <div>
          <label>Client Name:</label>
          <input type="text" name="clientName" value={details.clientName} onChange={handleChange} required />
        </div>
        <div>
          <label>Project Date:</label>
          <input type="date" name="projectDate" value={details.projectDate} onChange={handleChange} required />
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default ProjectDetails;
