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

//Users data
//var user; // To save the user that opened the site
var name, email;
var snapshotCounter = 0; //Counter to differentiate between first and other snapshots

// Create a new collection and add data

//Navbar signup/signout and login action
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
document.getElementById("userOpen").onclick = function () {
    if (document.getElementById("userForm").style.display == "block") {
        document.getElementById("userForm").style.display = "none";

    } else {
        document.getElementById("userForm").style.display = "block";
    }
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
document.getElementById("signupSubmit").onclick = function () {
    var signupFormBody = document.querySelector("#signupForm .form-container");
    var firstName = signupFormBody.querySelector('input[name="firstName"]').value;
    var lastName = signupFormBody.querySelector('input[name="lastName"]').value;
    var email = signupFormBody.querySelector('input[name="email"]').value;
    var password = signupFormBody.querySelector('input[name="password"]').value;
    //var user = null;

    if (validateEmail(email) & valiatePassword(password)) {

        auth.createUserWithEmailAndPassword(email, password).then(async function () { //check if this async/await is ok 
            document.getElementById("signupForm").style.display = "none";
            var user = await firebase.auth().currentUser;
            user.sendEmailVerification();
            return user;
        }).then(function (user) {

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

            user.updateProfile({
                displayName: firstName + " " + lastName,
                email: email,
                emailVerified: false

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
        });

    }
}

// login write to database 
document.getElementById("loginSubmit").onclick = function () {
    var loginFormBody = document.querySelector("#loginForm .form-container");
    var loginEmail = loginFormBody.querySelector("input[name='email']").value;
    var loginPassword = loginFormBody.querySelector('input[name="password"]').value;
    /* use async functions whenever we need to interact with a server */
    /* no need for async unless you're using await*/
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword).then(function () {
        document.getElementById("loginForm").style.display = "none";
    }).catch(function (error) {
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
    });
};

//Helper function to write messages with styling to the message-area
function printMessage(firstName, message, darker) {
    var messageAreaBody = document.getElementById("message-area").children[0];
    messageAreaBody.innerHTML += "<div class='container chatBox " + darker + "'>" + "<p><b>" + firstName + ": </b></p>" + "<p>" + message + "</p></div>"
    messageAreaBody.children[messageAreaBody.childElementCount - 1].scrollIntoView();

}

function loadUpdateMessages(user) {
    //user = currentUser;
    name = user.displayName;

    email = user.email;


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
                if (change.type === "added" && change.doc.data().fromEmail != email) {
                    var messageAreaBody = document.getElementById("message-area").children[0];
                    printMessage(change.doc.data().fromName, change.doc.data().msg, messageAreaBody.children[messageAreaBody.childElementCount - 1].classList.contains("darker") ? "" : " darker");

                }
            })
        }
    })
};

// Write messages to database
function submit() {
    newMessage = document.getElementById("input").value;

    if (newMessage.length != 0) {
        db.collection("rooms").doc("general").collection("messages").add({
                fromEmail: email,
                fromName: name.split(" ")[0],
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

        printMessage(name.split(" ")[0], newMessage, messageAreaBody.childElementCount == 0 || messageAreaBody.children[messageAreaBody.childElementCount - 1].classList.contains("darker") ? "" : " darker");
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

document.getElementById("logout").onclick = function () {
    firebase.auth().signOut().then(function () {
        document.getElementById("userForm").style.display = "none";

    })
}

function initApp() {
    firebase.auth().onAuthStateChanged(function (user) {

        if (user && user.emailVerified) {
            document.getElementById("loginOpen").style.display = "none";
            document.getElementById("signupOpen").style.display = "none";
            document.getElementById("userOpen").style.display = "block";
            document.querySelector("#userOpen").innerHTML = '<span class="glyphicon glyphicon-user"></span>' + "&nbsp;&nbsp;" + user.displayName;
            document.querySelector("#input").disabled = false;
            loadUpdateMessages(user);
        } else if (user && !(user.emailVerified)) {
            document.getElementById("loginOpen").style.display = "block";
            document.getElementById("signupOpen").style.display = "block";
            document.getElementById("userOpen").style.display = "none";
            document.querySelector("#input").disabled = true;
            firebase.auth().signOut();
            alert("Please verify your email.");

        } else if (!user) {
            document.getElementById("loginOpen").style.display = "block";
            document.getElementById("signupOpen").style.display = "block";
            document.getElementById("userOpen").style.display = "none";
            document.querySelector("#input").disabled = true;
            var messageAreaBody = document.getElementById("message-area").children[0];
            messageAreaBody.innerHTML = "";
        }
    })
}
window.onload = function () {
    initApp();
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