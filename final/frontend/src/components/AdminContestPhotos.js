import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const AdminContestPhotos = ({ contest, show, onHide, onWinnerDeclared }) => {
  const [photos, setPhotos] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [winnerDeclared, setWinnerDeclared] = useState(false);
  const [winnerName, setWinnerName] = useState("");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoadingPhotos(true);

      const photosResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/photos/fetch`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      const filteredPhotos = photosResponse.data.filter(
        (photo) => photo.contest_title === contest.title
      );
      setPhotos(filteredPhotos);

      // Fetch votes
      const votesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/votes/fetch`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      const filteredVotes = votesResponse.data.filter(
        (vote) => vote.contest_title === contest.title
      );
      const counts = filteredVotes.reduce((acc, vote) => {
        acc[vote.photo_url] = (acc[vote.photo_url] || 0) + 1;
        return acc;
      }, {});
      setVoteCounts(counts);
    } catch (error) {
      console.error("Error fetching photos and votes:", error);
    } finally {
      setLoadingPhotos(false);
    }
  }, [contest]);

  useEffect(() => {
    if (contest) {
      setWinnerDeclared(contest.status === 'ended' || !!contest.winnerName);
      setWinnerName(contest.winnerName || "");
      fetchPhotos();
    }
  }, [contest, fetchPhotos]);

  const handleDeletePhoto = async (photo) => {
    try {
      setLoadingDelete(true);

      // Deleting the photo
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/photos/delete`, {
        data: {
          contest_title: contest.title,
          email: photo.email,
        },
        headers: {
          "x-api-key": process.env.REACT_APP_API_KEY,
        },
        withCredentials: true,
      });
      console.log("DELETED PHOTO");

      // Deleting associated votes for the photo
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/votes/deleteimage`,
        {
          data: {
            photo_url: photo.photo_url,
          },
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      console.log("DELETED VOTES ON THAT PHOTO");

      // Refresh photos after deletion
      fetchPhotos();
      setSuccessMessage("Photo and associated votes deleted successfully!");
      setErrorMessage("");
    } catch (error) {
      console.error("Error deleting photo or associated votes:", error);
      setErrorMessage("Failed to delete photo or associated votes.");
      setSuccessMessage("");
    } finally {
      setLoadingDelete(false);
    }
  };

  const getWinner = useCallback(() => {
    if (photos.length === 0) return null;
    let maxVotes = -1;
    let winner = null;
    photos.forEach(photo => {
      const votes = voteCounts[photo.photo_url] || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = photo;
      }
    });
    return { winner, maxVotes };
  }, [photos, voteCounts]);

  const handleDeclareWinner = async () => {
    const winnerData = getWinner();
    if (!winnerData || !winnerData.winner) {
      alert("No submissions available to declare a winner.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/contests/end`,
        {
          title: contest.title,
          winnerPhotoUrl: winnerData.winner.photo_url,
          winnerName: winnerData.winner.uploaded_by,
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      setSuccessMessage(`Winner ${winnerData.winner.uploaded_by} declared successfully! Emails sent to users.`);
      setWinnerDeclared(true);
      setWinnerName(winnerData.winner.uploaded_by);
      if (onWinnerDeclared) {
        onWinnerDeclared();
      }
    } catch (error) {
      console.error("Error declaring winner:", error);
      setErrorMessage("Failed to declare winner. Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Photos for Contest: {contest.title}</Modal.Title>
      </Modal.Header>
      {successMessage && (
        <div
          className="alert alert-success d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{errorMessage}</div>
        </div>
      )}

      <Modal.Body>
        {loadingPhotos ? (
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-2">
              <span className="sr-only"></span>
            </Spinner>
            <div>Loading photos...</div>
          </div>
        ) : (
          <>
            {winnerDeclared ? (
              <div className="alert alert-success py-2 mb-3 text-center">
                🎉 <strong>Winner Declared:</strong> {winnerName}
              </div>
            ) : (
              photos.length > 0 && (() => {
                const winnerData = getWinner();
                if (winnerData && winnerData.winner) {
                  return (
                    <div className="alert alert-info py-2 mb-3">
                      👑 <strong>Current Leader:</strong> {winnerData.winner.uploaded_by} ({winnerData.maxVotes} votes)
                    </div>
                  );
                }
                return null;
              })()
            )}
            {photos.length > 0 ? (
              <div className="row">
                {photos.map((photo) => (
                  <div className="col-md-4 mb-4" key={photo._id}>
                    <div className="card">
                      <img
                        src={photo.photo_url}
                        className="card-img-top"
                        alt="Contest submission"
                      />
                      <div className="card-body">
                        <p>Uploaded by: {photo.uploaded_by}</p>
                        <p><strong>Votes:</strong> {voteCounts[photo.photo_url] || 0}</p>
                        {loadingDelete ? (
                          <div className="text-center">
                            <Spinner
                              animation="border"
                              size="sm"
                              role="status"
                              className="mb-2"
                            >
                              <span className="sr-only"></span>
                            </Spinner>
                            <div>Deleting...</div>
                          </div>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={() => handleDeletePhoto(photo)}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No photos available for this contest.</p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {photos.length > 0 && (
          <Button 
            variant="success" 
            onClick={handleDeclareWinner}
            disabled={winnerDeclared}
          >
            {winnerDeclared ? "Winner Declared" : "Declare Winner"}
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdminContestPhotos;
