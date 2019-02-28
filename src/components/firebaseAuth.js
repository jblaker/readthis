import firebase from '../firebase.js';
import 'firebase/auth';

// https://firebase.google.com/docs/auth/web/auth-state-persistence

const FirebaseAuth = {
  authenticate(email, password, cb) {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function() {
      return firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        cb();
      });
    })
    .catch(function(error) {
      cb(error);
    });
  },
  signout(cb) {
    firebase.auth().signOut().then(function() {
      cb();
    }, function(error) {
      cb(error);
    });
  }
};

export default FirebaseAuth;
