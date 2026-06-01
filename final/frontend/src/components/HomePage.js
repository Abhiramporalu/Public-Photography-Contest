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
      {/* Welcome Banner */}
      <div className="glass-card text-center mb-5 mt-3 border-0" style={{background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))'}}>
        <h1 className="display-4 fw-bold gradient-text mb-3">{getWelcomeMessage()}</h1>
        <p>Capture moments. Compete. Win recognition.</p>
      </div>

      {/* Trending Hashtags / Badges */}
      <div className="text-center mb-5">
        <h4 className="mb-4 gradient-text">🔥 Trending Contests</h4>
        {trendingTags.map((tag, index) => (
          <Badge key={index} pill bg="dark" text="light" className="mx-2 p-2 border border-secondary" style={{fontSize: '1rem'}}>
            {tag}
          </Badge>
        ))}
      </div>

      {/* Responsive Grid */}
      <div className="row g-4">
        {[ 
          { title: 'Nature Wonders', img: 'https://picsum.photos/id/1015/600/400', link: '/contest/nature-wonders' },
          { title: 'Portrait Stories', img: 'https://picsum.photos/id/8/450/300?grayscale&blur=2', link: '/contest/portrait-stories' },
          { title: 'Travel Moments', img: 'https://picsum.photos/id/1031/600/400', link: '/contest/travel-moments' },
          { title: 'Urban Landscapes', img: 'https://picsum.photos/id/237/600/400', link: '/contest/urban-landscapes' },
        ].map((item, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-3">
            <div className="photo-box shadow-sm">
              <img src={item.img} alt={item.title} />
              <div className="photo-caption">{item.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">

      {/* Single Explore Contest Button (Below the Grid) */}
      <Button as="a" href="/contests" className="btn-premium px-5 py-3 fs-5">
        Explore Contests
      </Button>
      </div>
    </Container>
  );
};

export default HomePage;
