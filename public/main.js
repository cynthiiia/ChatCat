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

var db = firebase.firestore();
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


// Signup write to database
document.getElementById("signupSubmit").onclick = function () {
    var signupFormBody = document.querySelector("#signupForm .form-container");

    db.collection("users").doc(signupFormBody.querySelector('input[name="email"]').value).set({
            firstName: signupFormBody.querySelector('input[name="firstName"]').value,
            lastName: signupFormBody.querySelector('input[name="lastName"]').value,
            email: signupFormBody.querySelector('input[name="email"]').value,
            password: signupFormBody.querySelector('input[name="password"]').value
        })
        .then(function () {
            console.log("Document written sucessfully!");
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
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
    /* use async functions whenever we need to interact with a server */
    /* no need for async unless you're using await*/

    db.collection("users").doc(email).get().then(function (doc) {
        if (doc.exists) {
            if (doc.data().password == password) {
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
                                printMessage(change.doc.data().fromName, change.doc.data().msg, messageAreaBody.children[messageAreaBody.childElementCount - 1 ].classList.contains("darker") ? "" : " darker");
                           
                            }
                        })
                    }
                })
            } else {
                alert("Incorrect password");
            }
        } else {
            alert("User does not exist");
        }
    }).catch(function (error) {

    });
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



//Reverse function 
/* document.getElementById("reverse").onclick = function () {
    document.getElementById("message-area").children[0].innerHTML += "<p>________________________</p>";
    document.getElementById("message-area").children[0].innerHTML += "<p>Your messages in reverse:</p>";
    for (let i = messages.length - 1; i >= 0; i--) {
        document.getElementById("message-area").children[0].innerHTML += "<p>" + messages[i] + "</p>";
    }
    document.getElementById("message-area").children[0].innerHTML += "<p>________________________</p>";
} */