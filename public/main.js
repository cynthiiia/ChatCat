var firebaseConfig = {
    apiKey: "AIzaSyBhe-8l45IwfWCDDPBjABMim1JFmIRPZ0U",
    authDomain: "chatcat-owo.firebaseapp.com",
    databaseURL: "https://chatcat-owo.firebaseio.com",
    projectId: "chatcat-owo",
    storageBucket: "chatcat-owo.appspot.com",
    messagingSenderId: "600189261122",
    appId: "1:600189261122:web:7919246492197690"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//Firestore
var db = firebase.firestore();
//Firebase Authenticator
var auth = firebase.auth();

// Create a new collection and add data

//Navbar signup and login action
document.getElementById("signupOpen").onclick = function () {
    if (document.getElementById("signupForm").style.display == "block") {
        document.getElementById("signupForm").style.display = "none";

    } else {
        document.getElementById("signupForm").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
    }
}

document.getElementById("signupCancel").onclick = function () {
    document.getElementById("signupForm").style.display = "none";
}
document.getElementById("loginOpen").onclick = function () {
    if (document.getElementById("loginForm").style.display == "block") {
        document.getElementById("loginForm").style.display = "none";

    } else {
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("signupForm").style.display = "none";
    }
}

document.getElementById("loginCancel").onclick = function () {
    document.getElementById("loginForm").style.display = "none";
}


// Email checker for signups
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // check this
    var signupFormBody = document.querySelector("#signupForm .form-container");
    signupFormBody.children[7].innerHTML = "";

    if ((re.test(String(email).toLowerCase())) == false) {
        signupFormBody.children[7].innerHTML += "Please enter a valid email";
        return false;
    } else {
        return true;
    }
}
//Password checker for signups
function valiatePassword(password) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    var signupFormBody = document.querySelector("#signupForm .form-container");
    signupFormBody.children[10].innerHTML = "";

    if (re.test(String(password)) == false) {
        signupFormBody.children[10].innerHTML += "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character";
        return false;
    } else {
        return true;
    }
}

// Signup write to database
document.getElementById("signupSubmit").onclick = async function () {
    var signupFormBody = document.querySelector("#signupForm .form-container");
    var firstName = signupFormBody.querySelector('input[name="firstName"]').value;
    var lastName = signupFormBody.querySelector('input[name="lastName"]').value;
    var email = signupFormBody.querySelector('input[name="email"]').value;
    var password = signupFormBody.querySelector('input[name="password"]').value;

    if (validateEmail(email) & valiatePassword(password)) {
        var validSignupInfo = true;

        await auth.createUserWithEmailAndPassword(email, password).then(function(user) {
            return user.updateProfile({
                displayName: firstName + " " + lastName,
                email: email
            })
        }).catch(function (error) { // Handle Errors here. --> figure out proper errors to catch here
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                alert('The password is too weak.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
            validSignupInfo = false;
        });

        if (validSignupInfo == true) {
            db.collection("users").doc(email).set({
                    firstName: firstName,
                    lastName: lastName,
                    email: email
                })
                .then(function () {
                    console.log("Document written sucessfully!");
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                });

            document.querySelector(".nav").innerHTML = '<li> <a id="signupOpen"> Sign Out</a></li>';
        }

    }
}


//Helper function to determine the user's name from their email
/* async function findName(email) {
    var firstName = "";
    await db.collection("users").doc(email).get().then(function (doc) {
        firstName = doc.data().firstName;
    })
    return firstName;
} */


//Helper function to write messages with styling to the message-area
function printMessage(firstName, message, darker) {
    document.getElementById("message-area").children[0].innerHTML += "<div class='container chatBox " + darker + "'>" + "<p><b>" + firstName + ": </b></p>" + "<p>" + message + "</p></div>"


}

var user; // To save the user that opened the site
var snapshotCounter = 0; //Counter to differentiate between first and other snapshots

// login write to database 
document.getElementById("loginSubmit").onclick = function () {
    var loginFormBody = document.querySelector("#loginForm .form-container");
    var email = loginFormBody.querySelector("input[name='email']").value;
    var password = loginFormBody.querySelector('input[name="password"]').value;
    var validLoginInfo = true;
    /* use async functions whenever we need to interact with a server */
    /* no need for async unless you're using await*/
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === 'auth/wrong-password') {
            document.querySelector("#loginForm .form-container").children[7].innerHTML = "Username and/or password invalid.";

        } else if (errorCode === 'user-not-found') {
            document.querySelector("#loginForm .form-container").children[7].innerHTML = "Username and/or password invalid.";

        } else {
            document.querySelector("#loginForm .form-container").children[7].innerHTML = errorMessage;
        }
        validLoginInfo = false;
        // ...
    });
    if (validLoginInfo == true) {
        db.collection("users").doc(email).get().then(function (doc) {
            if (doc.exists) {
                
                document.getElementById("loginForm").style.display = "none";
                alert('Sign in Successful, ' + doc.data().firstName + " " + doc.data().lastName);
                user = doc;

                // Printing last 5 messsages sent to the chat when the user enters the chat after logging in
                messagesRefInOrder = db.collection("rooms").doc("general").collection("messages").orderBy("timestamp", "desc").limit(5);
                messagesRefInOrder.get().then(function (collection) {
                    var messagesInfo = [];
                    collection.forEach(function (message) {
                        messagesInfo.push([message.data().fromName, message.data().msg]);
                    })
                    for (let i = messagesInfo.length - 1; i >= 0; i--) {
                        printMessage(messagesInfo[i][0], messagesInfo[i][1], i % 2 == 0 ? "darker" : "");
                    }
                });
                // Updating the user's screen for any messages that are newly sent by other users 
                messagesRefInOrder.onSnapshot(function (snapshot) {
                    snapshotCounter += 1;
                    if (snapshotCounter > 1) {
                        snapshot.docChanges().forEach(function (change) {
                            if (change.type === "added" && change.doc.data().fromEmail != user.data().email) {
                                var messageAreaBody = document.getElementById("message-area").children[0];
                                printMessage(change.doc.data().fromName, change.doc.data().msg, messageAreaBody.children[messageAreaBody.childElementCount - 1].classList.contains("darker") ? "" : " darker");

                            }
                        })
                    }
                })
            }
        })
    }
};

// Write messages to database
function submit() {
    newMessage = document.getElementById("input").value;

    if (newMessage.length != 0) {
        db.collection("rooms").doc("general").collection("messages").add({
                fromEmail: user.data().email,
                fromName: user.data().firstName,
                msg: newMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(function () {
                console.log("Document written sucessfully!");
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
        var messageAreaBody = document.getElementById("message-area").children[0];

        printMessage(user.data().firstName, newMessage, messageAreaBody.children[messageAreaBody.childElementCount - 1].classList.contains("darker") ? "" : " darker");
        document.getElementById("input").value = "";
    }
}
document.getElementById("submit").onclick = function () {
    submit();
}

function enterSubmit() {
    var key = window.event.keyCode;
    if (key == 13) {
        window.event.preventDefault();
        submit();
    }
}

function initApp() {
    firebase.auth().onAuthStateChanged(function(currentUser) {
        if(currentUser) {
            user = currentUser;
        } else {
            user = null;
        }
    })
}

//Reverse function 
/* document.getElementById("reverse").onclick = function () {
    document.getElementById("message-area").children[0].innerHTML += "<p>________________________</p>";
    document.getElementById("message-area").children[0].innerHTML += "<p>Your messages in reverse:</p>";
    for (let i = messages.length - 1; i >= 0; i--) {
        document.getElementById("message-area").children[0].innerHTML += "<p>" + messages[i] + "</p>";
    }
    document.getElementById("message-area").children[0].innerHTML += "<p>________________________</p>";
} */