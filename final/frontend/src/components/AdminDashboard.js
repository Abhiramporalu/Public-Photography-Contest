import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import AdminContestPhotos from "./AdminContestPhotos";
import { AdminAuthContext } from "../context/AdminAuthContext";

// Parse a timezone-less string from datetime-local input (assumed IST) to a UTC ISO string
const parseISTDateToUTC = (dateString) => {
  if (!dateString) return "";
  // If it already has a timezone indicator (like 'Z' or offset), parse normally
  if (dateString.includes('Z') || dateString.match(/[+-]\d{2}:\d{2}$/)) {
    return new Date(dateString).toISOString();
  }
  // Otherwise append the IST offset (+05:30)
  return new Date(dateString + "+05:30").toISOString();
};

// Format a UTC date string from the database to YYYY-MM-DDTHH:mm representing the local IST representation
const formatUTCDateToISTInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Convert UTC date to IST date by adding 5.5 hours offset
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  
  // Format as YYYY-MM-DDTHH:mm
  const pad = (num) => String(num).padStart(2, '0');
  const year = istDate.getUTCFullYear();
  const month = pad(istDate.getUTCMonth() + 1);
  const day = pad(istDate.getUTCDate());
  const hours = pad(istDate.getUTCHours());
  const minutes = pad(istDate.getUTCMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AdminDashboard = () => {
  const [contests, setContests] = useState([]);
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [editContest, setEditContest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contestToDelete, setContestToDelete] = useState(null);
  const [viewContest, setViewContest] = useState(null); // State for viewing contest photos

  const { admin } = useContext(AdminAuthContext); // Use admin context for authentication
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate("/admin-login"); // Redirect to login if not admin
    }
    fetchContests();
  }, [admin, navigate]);

  const fetchContests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/contests/fetch`,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      setContests(response.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContest({ ...newContest, [name]: value });
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();

    // Check if the contest with the same title already exists
    const existingContest = contests.find(
      (contest) => contest.title === newContest.title
    );
    if (existingContest) {
      alert(`Contest with title "${newContest.title}" already exists.`);
      return;
    }

    try {
      const contestData = {
        ...newContest,
        start_date: parseISTDateToUTC(newContest.start_date),
        end_date: parseISTDateToUTC(newContest.end_date),
      };
      // If the contest title doesn't exist, proceed to create it
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/contests/insert`,
        contestData,
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      setNewContest({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
      });
      fetchContests(); // Fetch contests again to update the list
      setShowCreateModal(false);
      alert("Contest Added");
    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Error creating contest. Please try again.");
    }
  };

  const handleDeleteContest = async (contest) => {
    try {
      // Delete contest
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/contests/delete`,
          {
            data: { title: contest.title },
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
            },
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Error deleting contest:", error);
      }

      // Delete associated votes
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/votes/delete`,
          {
            data: { contest_title: contest.title },
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
            },
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Error deleting votes:", error);
      }

      // Delete all photos related to the contest
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/photos/deleteall`,
          {
            data: { contest_title: contest.title },
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
            },
            withCredentials: true,
          }
        );
      } catch (error) {
        console.error("Error deleting photos:", error);
      }

      // Refresh contest list
      fetchContests();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("General error during deletion:", error);
    }
  };

  const handleEditContest = (contest) => {
    setEditContest({
      ...contest,
      start_date: formatUTCDateToISTInput(contest.start_date),
      end_date: formatUTCDateToISTInput(contest.end_date),
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditContest({ ...editContest, [name]: value });
  };

  const handleUpdateContest = async (e) => {
    e.preventDefault();
    try {
      console.log(
        editContest.title,
        editContest.description,
        editContest.start_date,
        editContest.end_date
      );
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/contests/update`,
        {
          id: editContest._id,
          title: editContest.title,
          description: editContest.description,
          start_date: parseISTDateToUTC(editContest.start_date),
          end_date: parseISTDateToUTC(editContest.end_date),
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      setEditContest(null);
      fetchContests();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating contest:", error);
    }
  };

  const handleViewContest = (contest) => {
    setViewContest(contest);
  };

  const openDeleteModal = (contest) => {
    setContestToDelete(contest);
    setShowDeleteModal(true);
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4 gradient-text">Admin Dashboard</h2>

      <h3 className="text-center mt-4">Create Contest</h3>
      <div className="d-flex justify-content-center align-items-center mb-5">
        <Button className="btn-premium" onClick={() => setShowCreateModal(true)}>
          Create Contest
        </Button>
      </div>

      <h3 className="text-center mt-4">Manage Contests</h3>
      <div className="d-flex flex-wrap justify-content-center">
        {contests.map((contest) => (
          <div className="col-md-4 d-flex" key={contest._id}>
            <div className="glass-card mb-4 w-100 p-4">
              <div className="card-body">
                <h5 className="card-title">{contest.title}</h5>
                <p className="card-text">{contest.description}</p>
                <p className="card-text">
                  <small className="text-muted">
                    Start:{" "}
                    {new Date(contest.start_date).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </small>
                </p>
                <p className="card-text">
                  <small className="text-muted">
                    End:{" "}
                    {new Date(contest.end_date).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </small>
                </p>
                <div className="mt-3">
                <Button
                 className="btn-premium me-2 mb-2"
                  onClick={() => handleEditContest(contest)}
                >
                  Edit
                </Button>
                <Button
                  className="btn-outline-premium me-2 mb-2"
                  onClick={() => openDeleteModal(contest)}
                >
                  Delete
                </Button>
                <Button
                  className="btn-premium mb-2"
                  onClick={() => handleViewContest(contest)}
                >
                  View Photos
                </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Contest Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Contest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCreateContest}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={newContest.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                className="form-control"
                name="description"
                value={newContest.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Start Date (IST):</label>
              <input
                type="datetime-local"
                className="form-control"
                name="start_date"
                value={newContest.start_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date (IST):</label>
              <input
                type="datetime-local"
                className="form-control"
                name="end_date"
                value={newContest.end_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button className="btn-premium mt-3" type="submit">
              Create Contest
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Contest Modal */}
      {editContest && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Contest</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdateContest}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={editContest.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={editContest.description}
                  onChange={handleEditInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Start Date (IST):</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="start_date"
                  value={editContest.start_date}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date (IST):</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="end_date"
                  value={editContest.end_date}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <Button className="btn-premium mt-3" type="submit">
                Update Contest
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {/* Delete Contest Modal */}
      {contestToDelete && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Contest</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete the contest "
              {contestToDelete.title}"?
            </p>
            <Button
              className="btn-outline-premium mt-3"
              onClick={() => handleDeleteContest(contestToDelete)}
            >
              Delete
            </Button>
          </Modal.Body>
        </Modal>
      )}

      {/* View Contest Photos */}
      {viewContest && (
        <AdminContestPhotos
          contest={viewContest}
          show={!!viewContest}
          onHide={() => setViewContest(null)}
          onWinnerDeclared={fetchContests}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
