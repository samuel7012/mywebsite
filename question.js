// Function to generate random math questions
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;  // Random number between 1 and 10
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = Math.random() > 0.5 ? '+' : '-';  // Randomly choose between addition and subtraction
    const question = `${num1} ${operator} ${num2}`;
    const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    
    return {
        question: question,
        correctAnswer: correctAnswer
    };
}

// Initialize the quiz
let currentQuestion = generateQuestion();
document.getElementById("question").textContent = currentQuestion.question;

let isAnsweredCorrectly = false;

// Handle submit answer button click
document.getElementById("submit-answer").addEventListener("click", function() {
    const userAnswer = parseInt(document.getElementById("answer").value);

    // Check if the user's answer is correct
    if (userAnswer === currentQuestion.correctAnswer) {
        document.getElementById("feedback").textContent = "Correct! Well done!";
        isAnsweredCorrectly = true;
        document.getElementById("next-question").style.display = "inline"; // Show next question button
        document.getElementById("submit-answer").disabled = true; // Disable submit button
    } else {
        document.getElementById("feedback").textContent = "Incorrect! Try again.";
    }
});

// Handle next question button click
document.getElementById("next-question").addEventListener("click", function() {
    if (isAnsweredCorrectly) {
        // Generate a new question only if the previous answer was correct
        currentQuestion = generateQuestion();
        document.getElementById("question").textContent = currentQuestion.question;
        document.getElementById("answer").value = ''; // Clear the input field
        document.getElementById("feedback").textContent = '';
        document.getElementById("submit-answer").disabled = false; // Enable submit button
        document.getElementById("next-question").style.display = "none"; // Hide next question button
        isAnsweredCorrectly = false;
    }
});
