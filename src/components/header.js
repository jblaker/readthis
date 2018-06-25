import React from 'react';
import { Link } from 'react-router-dom';

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header>
    <div className="line" />
    <Link to="/">
      <img className="logo" src="/readthis.svg" />
    </Link>
  </header>
);

export default Header;
