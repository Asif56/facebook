import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyBmHrC6eXxqAOMg-md6FECxNRJfuoQGmCo",
  authDomain: "fb-mern-50d8a.firebaseapp.com",
  projectId: "fb-mern-50d8a",
  storageBucket: "fb-mern-50d8a.appspot.com",
  messagingSenderId: "464447492741",
  appId: "1:464447492741:web:786ee37363f77e1d6acfec",
  measurementId: "G-T2DGJ3PHXX"
};

const firebaseApp = firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()
const db = firebase.firestore()

export { auth, provider }
export default db