import React, { useContext } from 'react';
import { Container, Badge, Button } from 'react-bootstrap';
import { UserAuthContext } from '../context/UserAuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';

const HomePage = () => {
  const { user } = useContext(UserAuthContext);
  const { admin } = useContext(AdminAuthContext);

  const getWelcomeMessage = () => {
    if (admin) return `Welcome, ${admin.username}!`;
    else if (user) return `Welcome, ${user.username}!`;
    else return 'Welcome, Photographer!';
  };

  const trendingTags = ['#NatureBlast', '#PortraitPower', '#WanderLens', '#UrbanFrame'];

  return (
    <Container fluid className="p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');

          .banner {
            background: linear-gradient(135deg,rgb(210, 26, 247),rgb(56, 18, 54));
            color: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            font-family: 'Raleway', sans-serif;
            margin-bottom: 2rem;
          }

          .banner h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }

          .banner p {
            font-size: 1.2rem;
          }

          .responsive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }

          .photo-box {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
          }

          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          .photo-box:hover img {
            transform: scale(1.1);
          }

          .caption {
            position: absolute;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            width: 100%;
            padding: 10px;
            font-size: 1rem;
            text-align: center;
            font-family: 'Raleway', sans-serif;
          }

          .cta-button {
            background-color:rgba(212, 61, 239, 0.72);
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            display: block;
            margin: 2rem auto;
          }

          .cta-button:hover {
            background-color:rgba(255, 43, 255, 0.59);
            cursor: pointer;
          }

          .trending-section {
            margin: 2rem 0;
            text-align: center;
          }

          .trending-section h4 {
            font-family: 'Raleway', sans-serif;
            margin-bottom: 1rem;
            color: #ff4b2b;
          }

          .badge-custom {
            margin: 5px;
            font-size: 1rem;
            background-color: #ffe0e9;
            color:rgb(246, 244, 245);
            padding: 8px 14px;
            border-radius: 50px;
            font-family: 'Raleway', sans-serif;
          }
        `}
      </style>

      {/* Welcome Banner */}
      <div className="banner">
        <h1>{getWelcomeMessage()}</h1>
        <p>Capture moments. Compete. Win recognition.</p>
      </div>

      {/* Trending Hashtags / Badges */}
      <div className="trending-section">
        <h4>🔥 Trending Contests</h4>
        {trendingTags.map((tag, index) => (
          <Badge key={index} className="badge-custom">{tag}</Badge>
        ))}
      </div>

      {/* Responsive Grid */}
      <div className="responsive-grid">
        {[ 
          { title: 'Nature Wonders', img: 'https://picsum.photos/id/1015/600/400', link: '/contest/nature-wonders' },
          { title: 'Portrait Stories', img: 'https://picsum.photos/id/8/450/300?grayscale&blur=2', link: '/contest/portrait-stories' },
          { title: 'Travel Moments', img: 'https://picsum.photos/id/1031/600/400', link: '/contest/travel-moments' },
          { title: 'Urban Landscapes', img: 'https://picsum.photos/id/237/600/400', link: '/contest/urban-landscapes' },
        ].map((item, i) => (
          <div key={i} className="photo-box">
            <img src={item.img} alt={item.title} />
            <div className="caption">{item.title}</div>
          </div>
        ))}
      </div>

      {/* Single Explore Contest Button (Below the Grid) */}
      <Button
        as="a"
        href="/contests"
        className="cta-button"
      >
        Explore Contests
      </Button>
    </Container>
  );
};

export default HomePage;
