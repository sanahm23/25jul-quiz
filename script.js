let currentUser = {};
const box = document.getElementById("box");
const form = document.getElementById("form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("emailInput");
const usernameDisplay = document.getElementById("usernameDisplay");
let previous = document.getElementById("previous");
let boxquiz = document.getElementById("boxquiz");
let scorePage = document.getElementById("scorePage");


function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + expires + "; path=/";
}


function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
    }
    return null;
}



function setCurrentState() {
    localStorage.setItem(currentUser.email, JSON.stringify(currentUser));
}

function saveCurrentCookies() {
    setCookie("user", currentUser);
}

function setCurrentScreen() {

    const cookieStorage = getCookie("user");
    const localStorageData = localStorage.getItem("user");

    if (cookieStorage) {
        currentUser = cookieStorage;
    } else if (localStorageData) {
        currentUser = JSON.parse(localStorageData);
    } else {
        box.style.display = "inline-flex";
        boxquiz.style.display = "none";
        scorePage.style.display = "none"
        return;
    }

    if (currentUser.currentQuestion !== undefined) {

        userAnswers = currentUser.userAnswers || [];
        if (currentUser.currentQuestion >= quizData.length) {
            displayScorePage()
        } else {

            box.style.display = "none";
            boxquiz.style.display = "block";
            scorePage.style.display = "none"
            displayQuestion()

        }
        return;
    }
    box.style.display = "inline-flex";
    boxquiz.style.display = "none";
    scorePage.style.display = "none"
}


window.addEventListener("load", () => {
    setCurrentScreen();
});

window.addEventListener("beforeunload", () => {
    if (currentUser.currentQuestion !== undefined) {
        saveCurrentCookies();
    }
});


let quizData = [
    {
        question: "When was javascript invented?",
        choices: ["1995", "1994", "1996", "None of above"],
        answer: 0,
    },
    {
        question: "What does HTML stand for?",
        choices: [
            "Hypertext Markup Language",
            "Hypertext Markdown Language",
            "HyperLoop Machine Language",
            "None",
        ],
        answer: 0,
    },
    {
        question: "Which is the full form of CSS?",
        choices: [
            "Central style sheets",
            "Cascading style sheets",
            "Central simple sheets",
            "None",
        ],
        answer: 1,
    },
    {
        question: "What language runs in a web browser?",
        choices: ["Java", "C", "C++", "Javascript"],
        answer: 3,
    },
];


form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;

    const emailInput = document.getElementById("emailInput");
    const email = emailInput.value;
    const emailPattern = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email");
        emailInput.value = "";
        emailInput.focus();
        return;
    }

    if (localStorage.length >= 10) {
        alert("Session timeout. Maximum number of users logged in.");
        localStorage.clear();
        location.reload();
    }


    const storedUserData = JSON.parse(localStorage.getItem(email));
    if (storedUserData) {
        currentUser = storedUserData;
        displayScorePage()
        return;
    } else {
        currentUser = {
            username,
            email,
            score: 0,
            currentQuestion: 0
        };
        localStorage.setItem(email, JSON.stringify(currentUser));
        setCurrentState();
        saveCurrentCookies();
    }

    usernameDisplay.textContent = username;

    box.style.display = "none";
    boxquiz.style.display = "block";
    scorePage.style.display = "none"
    displayQuestion();
});

const submit = document.getElementById("submit");

let userAnswers = currentUser.userAnswers || [];

function displayQuestion() {
    if (currentUser.currentQuestion === undefined) {
        currentUser.currentQuestion = 0;
        currentUser.userAnswers = [];
        setCurrentState();
    }
    let questionElement = document.getElementById("question");
    let choiceElements = document.getElementsByTagName("label");

    questionElement.textContent =
        quizData[currentUser.currentQuestion].question;

    for (let i = 0; i < choiceElements.length; i++) {
        choiceElements[i].textContent =
            quizData[currentUser.currentQuestion].choices[i];
    }

    let previousAnswer = userAnswers[currentUser.currentQuestion];

    if (previousAnswer !== undefined) {
        let choices = document.getElementsByName("choice");
        choices[previousAnswer].checked = true;
    }

    if (currentUser.currentQuestion == 0) {
        previous.style.display = "none";
    } else {
        previous.style.display = "inline-flex";
    }
}

function updateOptions() {

    let choices = document.getElementsByName("choice");
    let selectedChoice = -1;

    for (let i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            selectedChoice = parseInt(choices[i].value);
            for (let j = 0; j < choices.length; j++) {
                choices[j].checked = false;
            }
            break;
        }
    }

    userAnswers[currentUser.currentQuestion] = selectedChoice;
    currentUser.userAnswers = userAnswers;
    setCurrentState();
    saveCurrentCookies();

    if (selectedChoice == -1) {
        alert("Please select option!!!");
        return;
    }


    currentUser.currentQuestion++;

    if (currentUser.currentQuestion === quizData.length) {
        calculateScore();
        displayScorePage()

    } else {
        displayQuestion();
    }
}

submit.addEventListener("click", updateOptions);

function displayScorePage() {
    box.style.display = "none";
    boxquiz.style.display = "none";
    scorePage.style.display = "block";

    const allUserData = Object.values(localStorage);

    const scoreTableBody = document.getElementById("scoreTableBody");
    scoreTableBody.innerHTML = "";
    allUserData.forEach((userDataJSON) => {
        const user = JSON.parse(userDataJSON);
        const row = document.createElement("tr");

        const usernameCell = document.createElement("td");
        usernameCell.textContent = user.username;
        row.appendChild(usernameCell);

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;
        row.appendChild(emailCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = user.score;
        row.appendChild(scoreCell);

        scoreTableBody.appendChild(row);
    });

}

function calculateScore() {
    let score = 0;
    for (let i = 0; i < quizData.length; i++) {
        if (userAnswers[i] === quizData[i].answer) {
            score++;
        }
    }
    currentUser.score = score;
    setCurrentState();
    saveCurrentCookies();
}

function PreviousQuestion() {
    currentUser.currentQuestion--;
    setCurrentState();
    saveCurrentCookies();

    displayQuestion()
}

previous.addEventListener("click", PreviousQuestion);

function restartApp() {
    if (localStorage.length >= 10) {
        alert("Session timeout. Maximum number of users logged in.");
        localStorage.clear();
        window.close();
    }

    document.getElementById("form").reset();
    currentUser = {};
    userAnswers = [];


    box.style.display = "inline-flex";
    boxquiz.style.display = "none";
    scorePage.style.display = "none"
}

document.getElementById("restart").addEventListener("click", restartApp);
