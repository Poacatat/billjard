import {getAuth, createUserWithEmaiAndPAssword} from "firebase/auth";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

var admin = require("firebase-admin");

var serviceAccount = require("/secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://biljard-elo-default-rtdb.firebaseio.com"
})

const auth = getAuth();
const provider = new GoogleAuthProvider();


async function new_player(username){
    try {
        const token = await auth.currentUser.getIdToken();

        const response = await fetch('http://localhost/api/players/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token,username})
        });

        const data = await response.json();

    } catch (error){
        console.error('Error creating new player:', error);
    }
}


async function new_user(username, email, pwd){
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pwd);
        const token = await result.user.getIdToken();

        const response = await fetch('http://localhost/api/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token})
        });

        const data = await response.json();
        new_player(username)
    } catch (error){
        console.error('Error creating new user:', error);
    }

}

async function login(email, pwd){
    try {
        const result = await signInWithUserNameAndPassword(email, pwd);
        const token = await result.user.getIdToken(); 

        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token})
        });

        const data = await response.json();
        console.log('Backend Response:', data);
    } catch (error) {
        console.error('Error during login:', error);
    }
}



async function get_game_by_uid(uid) {
    try {
        let response = await fetch('http://localhost:5000/api/games/get/' + uid);
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}


async function get_game() {
    try {
        let response = await fetch('http://localhost:5000/api/games/get');
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

async function get_player_games(uid) {
    try {
        let response = await fetch('http://localhost:5000/api/games/get/' +uid );
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

async function add_game(players, winner, token) {
    try {
        let response = await fetch('http://localhost:5000/api/games/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ players, winner, token })
        });
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error adding game:', error);
    }
}



async function get_player(uid) {
    try {
        let response = await fetch('http://localhost:5000/api/players/get/' + uid);
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching player:', error);
    }
}
