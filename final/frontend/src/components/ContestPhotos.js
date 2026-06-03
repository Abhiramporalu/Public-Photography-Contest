import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { UserAuthContext } from '../context/UserAuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';

const ContestPhotos = ({ contestTitle, onBack }) => {
    const [photos, setPhotos] = useState([]);
    const [votedPhoto, setVotedPhoto] = useState(null);
    const [voteCounts, setVoteCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useContext(UserAuthContext);
    const { admin } = useContext(AdminAuthContext);

    const loggedInEmail = user?.email || admin?.email;

    useEffect(() => {
        const fetchPhotosAndVotes = async () => {
            try {
                // Fetch photos related to the contest
                const photosResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/photos/fetch`, {
                    headers: {
                        'x-api-key': process.env.REACT_APP_API_KEY,
                    },
                    withCredentials: true,
                });

                const filteredPhotos = photosResponse.data.filter(photo => photo.contest_title === contestTitle);
                setPhotos(filteredPhotos);

                // Fetch user votes
                const votesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/votes/fetch`, {
                    headers: {
                        'x-api-key': process.env.REACT_APP_API_KEY,
                    },
                    withCredentials: true,
                });

                const userVote = votesResponse.data.find(vote => 
                    vote.email === loggedInEmail && vote.contest_title === contestTitle
                );

                if (userVote) {
                    setVotedPhoto(userVote.photo_url);
                }

                // Count votes for each photo
                const contestVotes = votesResponse.data.filter(vote => vote.contest_title === contestTitle);
                const counts = contestVotes.reduce((acc, vote) => {
                    acc[vote.photo_url] = (acc[vote.photo_url] || 0) + 1;
                    return acc;
                }, {});
                setVoteCounts(counts);

                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchPhotosAndVotes();
    }, [contestTitle, loggedInEmail]);

    const handleVote = async (photoUrl) => {
        if (!loggedInEmail) {
            alert("Please login to vote.");
            return;
        }
        if (votedPhoto) {
            alert("You have already voted for this contest.");
            return; // Prevent re-voting
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/votes/insert`, {
                photo_url: photoUrl,
                email: loggedInEmail,
                contest_title: contestTitle
            }, {
                headers: {
                    'x-api-key': process.env.REACT_APP_API_KEY,
                },
                withCredentials: true,
            });

            setVotedPhoto(photoUrl);
            setVoteCounts(prev => ({
                ...prev,
                [photoUrl]: (prev[photoUrl] || 0) + 1
            }));
            console.log('Vote submitted successfully', response.data);
        } catch (error) {
            console.error('There was an error submitting the vote!', error);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}><Spinner animation="border" role="status"><span className="sr-only"></span></Spinner></div>;
    if (error) return <div>Error loading photos: {error.message}</div>;

    return (
        <Container>
            <Button variant="secondary" onClick={onBack}>Back to Contests</Button>
            <Row>
                {photos.map(photo => (
                    <Col md={4} key={photo._id} className="mb-4">
                        <Card>
                            <Card.Img variant="top" src={photo.photo_url} />
                            <Card.Body>
                                <Card.Text>Uploaded by: {photo.uploaded_by}</Card.Text>
                                <Card.Text><strong>Votes:</strong> {voteCounts[photo.photo_url] || 0}</Card.Text>
                                <Button
                                    variant={votedPhoto === photo.photo_url ? "success" : "primary"}
                                    onClick={() => handleVote(photo.photo_url)}
                                    disabled={!!votedPhoto} // Disable button if a vote is already given
                                >
                                    {votedPhoto === photo.photo_url ? "Voted" : "Vote"}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default ContestPhotos;
