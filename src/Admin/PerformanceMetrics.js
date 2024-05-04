import React, { useState } from "react";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../App";


function PerformanceMetricsForm() {
  const [kra, setKRA] = useState("");
  const [kpi, setKPI] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate if KRA and KPI are not empty
    if (kra.trim() === "" || kpi.trim() === "") {
      window.alert("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a new document reference within the "performancemetrics" collection
      const performanceMetricsRef = doc(collection(db, "performancemetrics"));

      // Save the form data to the document reference
      await setDoc(performanceMetricsRef, {
        kra: kra,
        kpi: kpi,
        timestamp: Timestamp.fromDate(new Date()),
      });

      window.alert("Performance Metrics Saved Successfully.");

      // Clear form fields after successful save
      setKRA("");
      setKPI("");
    } catch (error) {
      console.error("Error saving performance metrics:", error);
      window.alert("An error occurred. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" container">
      <div className="row">
      
       
          {/* <h2 className="text-center mb-4">Performance Metrics Form</h2> */}
          <form onSubmit={handleSave}>
            <div className=" ">
              <label htmlFor="kra" className="form-label">
                Key Result Area (KRA)
              </label>
              <input
                type="text"
                className="form-control"
                id="kra"
                value={kra}
                onChange={(e) => setKRA(e.target.value)}
                placeholder="Enter KRA"
                required
              />
            </div>
            <div className=" ">
              <label htmlFor="kpi" className="form-label">
                Key Performance Indicator (KPI)
              </label>
              <input
                type="text"
                className="form-control"
                id="kpi"
                value={kpi}
                onChange={(e) => setKPI(e.target.value)}
                placeholder="Enter KPI"
                required
              />
            </div>
            <div className="text-center mt-2">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        
        
      </div>

     
    </div>
  );
}

export default PerformanceMetricsForm;
