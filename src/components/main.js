import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Links from './links';
import Login from './login';
import SharedLinks from './shared-links';
import Firebase from '../firebase.js';
import 'firebase/auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Firebase.auth().currentUser != null ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/" component={Login} />
          <PrivateRoute path="/links/" component={Links} />
          <PrivateRoute path="/shared-links/" component={SharedLinks} />
          <Route component={Login} />
        </Switch>
      </main>
    );
  }
}

export default Main;
