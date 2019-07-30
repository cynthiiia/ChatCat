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
var activeChatID;

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

document.getElementById("createNewChat").onclick = function () {
    if (document.getElementById("newChatForm").style.display == "block") {
        document.getElementById("newChatForm").style.display = "none";

    } else {
        document.getElementById("newChatForm").style.display = "block";
    }
}
document.getElementById("newChatCancel").onclick = function () {
    document.getElementById("newChatForm").style.display = "none";
}


// Email checker for signups
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // check this
    var signupFormEmailWarning = document.querySelector("#signupForm .form-container").children[7];
    signupFormEmailWarning.textContent = "";

    if ((re.test(String(email).toLowerCase())) == false) {
        signupFormEmailWarning.textContent = "Please enter a valid email"; // Fix innerhtml issues
        return false;
    } else {
        return true;
    }
}
//Password checker for signups
function valiatePassword(password) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    var signupFormPasswordWarning = document.querySelector("#signupForm .form-container").children[10];
    signupFormPasswordWarning.textContent = "";

    if (re.test(String(password)) == false) {
        signupFormPasswordWarning.textContent = "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character";
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
                    email: email,
                    loggedIn: false,
                    userChatsOrder: []
                })
                .then(function () {
                    console.log("Document written sucessfully for this user!");
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

        var loginFormWarning = document.querySelector("#loginForm .form-container").children[7];
        if (errorCode === 'auth/wrong-password') {
            loginFormWarning.textContent = "Username and/or password invalid.";

        } else if (errorCode === 'user-not-found') {
            loginFormWarning.textContent = "Username and/or password invalid.";

        } else {
            loginFormWarning.textContent = errorMessage;
        }
    });
};

//Functions for drag and drop
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var sourceElement = document.getElementById(ev.dataTransfer.getData("text")).firstElementChild;
    var chatName = sourceElement.textContent;
    var chatID = sourceElement.id;
    var targetID = ev.currentTarget.children[0].children[0].id;
    // delete the item first 
    sourceElement.parentElement.parentElement.parentElement.removeChild(sourceElement.parentElement.parentElement.nextElementSibling);
    sourceElement.parentElement.parentElement.parentElement.removeChild(sourceElement.parentElement.parentElement);

    // reprint the chat button
    printChatButton(chatName, chatID, targetID);

    // neeed to still update the database so that it pulls properly
    db.collection("users").doc(email).get().then(function (user) {
        var updatedUserChatsOrder = [];
        Object.values(user.data().userChatsOrder).map((item) => {
            if (item == targetID) {
                updatedUserChatsOrder.push(chatID);
                updatedUserChatsOrder.push(item);
            } else if (item == chatID) {

            } else {
                updatedUserChatsOrder.push(item);
            }
        })
        db.collection("users").doc(email).update({
            userChatsOrder: updatedUserChatsOrder
        })


    })
}

//Helper function to write the chats button in the chats column
function printChatButton(chatName, chatID, location) {
    if (location == "top") {
        document.querySelector("#chats-header + hr").insertAdjacentHTML("afterend", '<div class="row"  ondrop= "drop(event)" ondragover="allowDrop(event)"><div  draggable="true" ondragstart="drag(event)" id = "drag' + chatID + '" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" ><a id=' + chatID + ' onclick="loadChat(this.id)"><h5>' + chatName + '</h5></a></div></div><hr>');
    } else if (location == "bottom") {
        document.getElementById("createNewChat").parentElement.parentElement.insertAdjacentHTML("beforebegin", '<div class="row"  ondrop= "drop(event)" ondragover="allowDrop(event)"><div  draggable="true" ondragstart="drag(event)" id = "col' + chatID + '" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" ><a id=' + chatID + ' onclick="loadChat(this.id)"><h5>' + chatName + '</h5></a></div></div><hr>');
    } else {
        document.getElementById(location).parentElement.parentElement.insertAdjacentHTML("beforebegin", '<div class="row"  ondrop= "drop(event)" ondragover="allowDrop(event)"><div  draggable="true" ondragstart="drag(event)" id = "col' + chatID + '" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" ><a id=' + chatID + ' onclick="loadChat(this.id)"><h5>' + chatName + '</h5></a></div></div><hr>');
    }

}

function clearChatMessages() {
    var messageAreaBody = document.getElementById("message-area").children[0];
    while (messageAreaBody.hasChildNodes()) {
        messageAreaBody.removeChild(messageAreaBody.firstChild);
    }
}


//Helper function to write messages with styling to the message-area
function printMessage(firstName, message, darker) {
    var messageAreaBody = document.getElementById("message-area").children[0];
    messageAreaBody.insertAdjacentHTML("beforeend", "<div class='container chatBox " + darker + "'>" + "<p><b>" + firstName + ": </b></p>" + "<p>" + message + "</p></div>");
    messageAreaBody.children[messageAreaBody.childElementCount - 1].scrollIntoView();

}

function loadOldMessages(chatID) {
    // Printing last 5 messsages sent to the chat when the user enters the chat after logging in
    messagesRefInOrder = db.collection("chatMessages").doc(chatID).collection("messages").orderBy("timestamp", "desc").limit(5);
    messagesRefInOrder.get().then(function (collection) {
        var messagesInfo = [];
        collection.forEach(function (message) {
            messagesInfo.push([message.data().fromName, message.data().msg]);
        })
        for (let i = messagesInfo.length - 1; i >= 0; i--) {
            printMessage(messagesInfo[i][0], messagesInfo[i][1], i % 2 == 0 ? "darker" : "");
        }
    });
}

var unsubscribeNewMessages;

function listenNewMessages(chatID) {
    // Updating the user's screen for any messages that are newly sent by other users 
    messagesRefInOrder = db.collection("chatMessages").doc(chatID).collection("messages").orderBy("timestamp", "desc");
    unsubscribeNewMessages = messagesRefInOrder.onSnapshot(function (snapshot) {
        snapshotCounter += 1;
        if (snapshotCounter > 1) {
            snapshot.docChanges().forEach(function (change) {
                if (change.type === "added" && change.doc.data().fromEmail != email) {
                    var messageAreaBody = document.getElementById("message-area").children[0];
                    printMessage(change.doc.data().fromName, change.doc.data().msg, messageAreaBody.childElementCount == 0 || messageAreaBody.children[messageAreaBody.childElementCount - 1].classList.contains("darker") ? "" : " darker");

                }
            })
        }
    })
};

function clearMembers() {
    var activeChatUsersArea = document.getElementById("active-chat-members");
    while (activeChatUsersArea.hasChildNodes()) {
        activeChatUsersArea.removeChild(activeChatUsersArea.firstChild);
    }
}

function printMember(loggedIn, memberEmail, firstName, lastName) {
    var activeChatUsersArea = document.getElementById("active-chat-members");
    if (loggedIn) {
        activeChatUsersArea.insertAdjacentHTML("beforeend", '<div class="row"><div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ' + (loggedIn == true ? "logged-in" : "logged-out") + '"><a id=' + memberEmail + '><img src="images/catHeadStatusOnline.png"><h5> &nbsp;' + firstName + " " + lastName + '</h5></a></div></div><hr>');
    } else {
        activeChatUsersArea.insertAdjacentHTML("beforeend", '<div class="row"><div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ' + (loggedIn == true ? "logged-in" : "logged-out") + '"><a id=' + memberEmail + '><img src="images/catHeadStatusOffline.png"><h5> &nbsp;' + firstName + " " + lastName + '</h5></a></div></div><hr>');

    }
}

function loadMembers(chatID) {
    db.collection("chatMembers").doc(chatID).get().then(function (chatMembers) {
        for (member in chatMembers.data()) {
            if (chatMembers.data()[member]) {
                db.collection("users").doc(member).get().then(function (memberData) {
                    console.log(member + " " + memberData.data());
                    printMember(memberData.data().loggedIn, memberData.data().email, memberData.data().firstName, memberData.data().lastName);
                })

            }

        }
    })
}

var unsubscribeNewMembers;

function listenNewMembers(chatID) {
    unsubscribeNewMembers = db.collection("chatMembers").onSnapshot(function (snapshot) {

        var newMembers = [];
        snapshot.docChanges().forEach(function (change) {
            if (change.type === "modified" && change.doc.id == chatID) {
                for (member in change.doc.data()) {
                    newMembers.push(member);
                }
            }
        })
        for (member of newMembers) {
            var activeChatUsersAreaMember = document.getElementById(member);
            if (!activeChatUsersAreaMember) {
                db.collection("users").doc(member).get().then(function (member) {
                    printMember(member.data().loggedIn, member.data().email, member.data().firstName, member.data().lastName);
                })

            }
        }
    })
}


var unsubscribeMembersStatus;
// issue with this is you will end up with a lot of reads because it looks at evrey single user change --> make more efficient!!!!!!!!!!!!!
function listenMembersStatus(chatID) {
    console.log("member status");
    unsubscribeMembersStatus = db.collection("users").onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            console.log("each change");
            if (change.type == "modified") {
                console.log("modified");
                var changedUserData = change.doc.data();
                db.collection("chatMembers").doc(chatID).get().then(function (chatMembers) {
                    if (document.getElementById(changedUserData.email)) {
                        // Determine current and old status of the user with changed data 
                        var currentStatus = changedUserData.loggedIn ? "logged-in" : "logged-out";
                        var oldStatus;
                        if (!document.getElementById(changedUserData.email).parentElement.classList.contains(currentStatus)) {
                            oldStatus = currentStatus == "logged-in" ? "logged-out" : "logged-in";
                        }
                        // Determine if user is a user of the active chat and compare to see if current and old status are the same, if not then need to update the button on front end 
                        if (chatMembers.data()[changedUserData.email] && currentStatus != oldStatus) {
                            document.getElementById(changedUserData.email).parentElement.classList.replace(oldStatus, currentStatus);
                        }
                    }
                })
            }
        })
    })
}

// Load the all information pertaining to the selected chat
function loadChat(chatID) {
    if (snapshotCounter != 0) {
        console.log("unsub");
        unsubscribeNewMessages(); //Unsub to previous chat first
        unsubscribeNewMembers();
        unsubscribeMembersStatus();
        snapshotCounter = 0;

    }
    activeChatID = chatID; // see if this is appropriate?
    window.location.hash = activeChatID; //fix this
    console.log("printing the title");
    document.querySelector("#header-area").children[0].children[1].textContent = document.getElementById(activeChatID).children[0].innerHTML;
    document.querySelector("#input").disabled = false;
    clearChatMessages();
    loadOldMessages(activeChatID);
    listenNewMessages(activeChatID);
    clearMembers();
    loadMembers(activeChatID);
    listenNewMembers(activeChatID);
    listenMembersStatus(activeChatID);

}

document.getElementById("newChatSubmit").onclick = function () {
    var newChatFormBody = document.querySelector("#newChatForm .form-container");
    var chatName = newChatFormBody.querySelector("input[name='chatName']").value;

    document.getElementById("newChatForm").style.display = "none";
    newChatFormBody.querySelector("input[name='chatName']").value = "";

    db.collection("chats").add({ //remember to make function to update doc and chat name if it changes 
        chatName: chatName,
        latestMessageTime: firebase.firestore.FieldValue.serverTimestamp() //shift the chats based on latest message?
    }).then(function (docName) {
        activeChatID = docName.id;
        //Add this user to the chat's user list
        var promise1 = db.collection("chatMembers").doc(activeChatID).set({
            [email]: true
        })
        // Add this chat to the user's chat collection 
        var promise2 = db.collection("users").doc(email).collection("userChats").doc(activeChatID).set({
            chatName: chatName
        });
        //Setup the sidebar chats, the url, and the header of the message section 
        printChatButton(chatName, activeChatID, "top");
        return Promise.all([promise1, promise2]);
    }).then(function () {
        loadChat(activeChatID);
        // List this chat in the order
        return db.collection("users").doc(email).get();
    }).then(function (user) {
        var updatedUserChatsOrder = [activeChatID];
        Object.values(user.data().userChatsOrder).map((item) => {
            updatedUserChatsOrder.push(item);
        })
        db.collection("users").doc(email).update({
            userChatsOrder: updatedUserChatsOrder
        })

    })
}

function clearChatsColumn() {
    var chatsColumn = document.getElementById("chats");
    var numChatElements = chatsColumn.childElementCount;
    for (var i = numChatElements - 3; i >= 2; i--) {
        console.log(numChatElements - 2 + " " + i + chatsColumn.children[i]);
        chatsColumn.removeChild(chatsColumn.children[i]);
    }
}



function loadChatsColumn() {
    return db.collection("users").doc(email).get().then(function (user) {
        var chatsToLoad = [];
        Object.values(user.data().userChatsOrder).map((item) => {
            chatsToLoad.push(item);
        })
        return chatsToLoad;
    }).then(function (chatsToLoad) {
        var promises = [];
        for (chat of chatsToLoad) {
            console.log(chat);
            promises.push(db.collection("users").doc(email).collection("userChats").doc(chat).get());
        }
        promises.push(new Promise((resolve, reject) => {
            resolve(chatsToLoad);
        }))
        return Promise.all(promises);
    }).then(function (resolutions) {
        var chatIds = resolutions[resolutions.length - 1];
        for (var i = 0; i < resolutions.length - 1; i++) {
            console.log(chatIds[i]);
            printChatButton(resolutions[i].data().chatName, chatIds[i], "bottom");

        }
        console.log("loading chats columN");
    })


    /* 
        userChatsRef = db.collection("users").doc(email).collection("userChats").limit(3); //figure out how to load chats based on time??
        userChatsRef.get().then(function (userChatsCollection) {
            userChatsCollection.forEach(function (userChat) {
                printChatButton(userChat.data().chatName, userChat.id);
            })
        }) */
}

// Write messages to database
function submit(newMessage = document.getElementById("input").value) {

    if (newMessage.length != 0) {
        db.collection("chatMessages").doc(activeChatID).collection("messages").add({
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
        console.log(snapshotCounter);
        if (snapshotCounter != 0) {
            console.log("unsub");
            unsubscribeNewMessages();
            unsubscribeMembersStatus();
            snapshotCounter = 0;

        }
        console.log(snapshotCounter);
        // Set that the user is offline 
        db.collection("users").doc(email).update({
            loggedIn: false
        });
        activeChatID = "";
        name, email = "";
        window.location.hash = "";
        clearChatsColumn();
        clearChatMessages();
        clearMembers();
        document.querySelector("#header-area").children[0].children[1].textContent = "Welcome to ChatCat!";

    });
}

function joinChat() {
    if (window.location.hash) { //need to chck if real chat id - doesnt checking if chatmembers is null check this?
        activeChatID = window.location.hash.replace("#", "");

        db.collection("chatMembers").doc(activeChatID).get().then(function (chatMembers) {

            if (chatMembers.exists && chatMembers.data()[email] != true) {
                db.collection("chats").doc(activeChatID).get().then(function (chat) {
                    var chatName = chat.data().chatName;
                    //Add this user to the chat's user list
                    var promise1 = db.collection("chatMembers").doc(activeChatID).set({
                        [email]: true
                    }, {
                        merge: true
                    })
                    // Add this chat to the user's chat collection 
                    var promise2 = db.collection("users").doc(email).collection("userChats").doc(activeChatID).set({
                        chatName: chatName
                    });
                    printChatButton(chatName, activeChatID, "top");
                    return Promise.all([promise1, promise2]);
                }).then(function () {
                    // Print that a user has joined 
                    //submit(name.split(' ')[0] + " has joined the chat!"); //problem with double messages for some reaosn 
                    loadChat(activeChatID);
                    return db.collection("users").doc(email).get();
                }).then(function (user) {
                    var updatedUserChatsOrder = [activeChatID];
                    Object.values(user.data().userChatsOrder).map((item) => {
                        updatedUserChatsOrder.push(item);
                    })
                    db.collection("users").doc(email).update({
                        userChatsOrder: updatedUserChatsOrder
                    })

                })
            } else if (chatMembers.exists && chatMembers.data()[email]) {
                loadChat(activeChatID);
            }
        })
    }
}


function initApp() {
    firebase.auth().onAuthStateChanged(function (user) {
        //figure out multiple instances of login issue 
        if (user && user.emailVerified) {
            document.getElementById("loginOpen").style.display = "none";
            document.getElementById("signupOpen").style.display = "none";
            document.getElementById("userOpen").style.display = "block";
            document.querySelector("#userOpen").innerHTML = '<span class="glyphicon glyphicon-user"></span>' + "&nbsp;&nbsp;" + user.displayName; // dont think this should be an isue?
            name = user.displayName;
            email = user.email;
            db.collection("users").doc(email).update({
                loggedIn: true
            }).then(async function () {
                await loadChatsColumn(); // this makes the program wait for the chat column to load before everything else loads b/c join chat is dependent on it --> so then I had to return the loadchatscolumn .then promise
                joinChat();

            })
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
        }
    })
}
window.onload = function () {
    initApp();
}