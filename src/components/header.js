import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Firebase from '../firebase.js';
import FirebaseAuthHelper from './firebaseAuth.js';
import 'firebase/auth';

function LogoutButton(props) {
  const isAuthed = props.isAuthed;
  const doLogout = props.doLogout;
  if (isAuthed) {
    return (
      <ul className="headerLinks">
        <li className="sharedLinks">
          <Link to="/shared-links">Shared Links</Link>
        </li>
        <li className="logOut">
          <span onClick={() => doLogout()}>Log Out</span>
        </li>
      </ul>
    );
  } else {
    return '';
  }
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthed: false,
      authStateUnsubscribe: null
    };
  }
  componentDidMount() {
    const unsub = Firebase.auth().onAuthStateChanged(
      function(user) {
        this.authStateChanged(user);
      }.bind(this)
    );
    this.setState({
      authStateUnsubscribe: unsub
    });
  }
  componentWillUnmount() {
    if (this.state.authStateUnsubscribe) {
      this.state.authStateUnsubscribe();
    }
  }
  authStateChanged(user) {
    this.setState({
      isAuthed: user != null
    });
    if (this.props.handler) {
      this.props.handler();
    }
    if (user) {
      if (this.props.history.location.pathname === '/') {
        this.props.history.push('/links');
      }
    } else {
      if (this.props.history.location.pathname !== '/') {
        this.props.history.push('/');
      }
    }
  }
  doLogout() {
    FirebaseAuthHelper.signout(function(error) {
      if (error) {
        console.log(error);
      }
    });
  }
  render() {
    return (
      <header>
        <div className="line" />
        <div className="container">
          <Link to="/">
            <img className="logo" src="/readthis.svg" alt="Read This!" />
          </Link>
          <LogoutButton
            isAuthed={this.state.isAuthed}
            doLogout={this.doLogout}
          />
        </div>
      </header>
    );
  }
}

export default Header;
