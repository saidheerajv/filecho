import React, { Component } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/database';

const config = {
apiKey: "AIzaSyAgH5pcfPM7TnOj3kI97Em6ftO2RmjDkow",
authDomain: "fcdb-d96d2.firebaseapp.com",
databaseURL: "https://fcdb-d96d2.firebaseio.com",
projectId: "fcdb-d96d2",
storageBucket: "fcdb-d96d2.appspot.com",
messagingSenderId: "638656852504",
appId: "1:638656852504:web:4f06fd4cfe62cb8d",
measurementId: "G-BQ9FZ9ZT4N"
};

   firebase.initializeApp(config);

export default firebase;
