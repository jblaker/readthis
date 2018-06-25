import React from 'react';
import { Link } from 'react-router-dom';

const Profiles = () => (
  <div className="container">
    <div className="row">
      <div className="col">
        <h3>Who Are You</h3>

        <div id="profiles">
          <Link to="/links/user1">
            <img
              className="profileImage"
              src="/images/avatar.png"
              alt="user1"
            />
          </Link>

          <Link to="/links/user2">
            <img
              className="profileImage"
              src="/images/avatar.png"
              alt="user2"
            />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default Profiles;
