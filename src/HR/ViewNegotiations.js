import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db, storage } from "../App";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Negotiation from "./Negotiation"; // Import your Negotiation component
import { Modal, Button } from "react-bootstrap";
import { jsPDF } from "jspdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faPlus  } from "@fortawesome/free-solid-svg-icons";

function DisplayNegotiations() {
  const location = useLocation();
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [negotiations, setNegotiations] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, `negotiated-${loggedInEmployeeId}`)
        );
        const fetchedNegotiations = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        //   .filter((negotiation) => negotiation.readyToAccept === "yes"); // Add this line to filter

        setNegotiations(fetchedNegotiations);
      } catch (error) {
        console.error("Error fetching negotiations:", error);
      }
    };

    fetchNegotiations();
  }, [loggedInEmployeeId]);

  const generatePDF = async (negotiation) => {
    const pdf = new jsPDF();
    const maxWidth = 180; // Maximum width of the text lines
  
    // Example of a formal offer letter format
    const date = new Date().toDateString(); // Gets today's date
    pdf.text(`Date: ${date}`, 10, 10);
    pdf.text('Company Name', 10, 20); // Replace with your company name
    pdf.text('Company Address', 10, 30); // Replace with your company address
    pdf.text('City, State, Zip', 10, 40); // Replace with city, state, zip
  
    pdf.text(`Dear ${negotiation.name},`, 10, 60);
  
    // Combine the text into a single string
    const offerText = `We are pleased to offer you the position of ${negotiation.jobTitle} at our organization. The details of the offer are as follows:`;
  
    // Use splitTextToSize to handle long text
    const lines = pdf.splitTextToSize(offerText, maxWidth);
    pdf.text(lines, 10, 70); // Adjust the y-coordinate as needed
  
    // Calculate the Y-coordinate for the next line of text
    let nextYPosition = 70 + (lines.length * 10); // Adjust the multiplier as needed based on line height
  
    // Print "Offered Salary"
    pdf.text(`Offered Salary: ${negotiation.offer}`, 10, nextYPosition);
  
    // Increment Y-coordinate for the next line
    nextYPosition += 10;
  
    // Print "Date of Joining"
    pdf.text(`Date of Joining: ${negotiation.DOJ}`, 10, nextYPosition);
  
    // More content...
  
    const pdfBlob = pdf.output('blob');
    const fileName = `Offer-${negotiation.name}.pdf`;
    await uploadPDFToStorage(pdfBlob, fileName, negotiation);
  };
  
  const uploadPDFToStorage = async (pdfBlob, fileName, negotiation) => {
    const storageRef = ref(storage, `negotiations/${fileName}`);
    try {
      const snapshot = await uploadBytes(storageRef, pdfBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const negotiationDocRef = doc(
        db,
        `negotiated-${loggedInEmployeeId}`,
        negotiation.id
      );
      await updateDoc(negotiationDocRef, { pdfUrl: downloadURL });

      console.log("PDF stored and Firestore updated with URL");
    } catch (error) {
      console.error("Error uploading PDF to storage:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  return (
    <div>
      <h2>Negotiations</h2>
      <Button variant="primary" onClick={handleShowModal}>
      <FontAwesomeIcon icon={faPlus} /> Add Negotiation
      </Button>

      <Modal size="lg" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Negotiation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Negotiation />
        </Modal.Body>
      </Modal>

      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Job Title</th>
            <th>Position Budget</th>
            <th>Offered to Candidate</th>
            <th>LWD</th>
            <th>DOJ</th>
            <th>Ready To Accept the Offer</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {negotiations.map((negotiation, index) => (
            <tr key={negotiation.id}>
              <td>{index + 1}</td>
              <td>{negotiation.name}</td>
              <td>{negotiation.jobTitle}</td>
              <td>{negotiation.positionBudget}</td>
              <td>{negotiation.offer}</td>
              <td>{formatDate(negotiation.LWD)}</td>
              <td>{formatDate(negotiation.DOJ)}</td>
              <td>{negotiation.readyToAccept}</td>
              <td>
                {negotiation.pdfUrl ? (
                  <a
                    href={negotiation.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Offer
                  </a>
                ) : (
                  <button onClick={() => generatePDF(negotiation)}>
                    Generate Offer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisplayNegotiations;
