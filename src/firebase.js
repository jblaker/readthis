//import firebase from 'firebase' // for dev
import firebase from 'firebase/app'

// Initialize Firebase
const config = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: ''
};
firebase.initializeApp(config);
export default firebase;
