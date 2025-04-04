let correctAnswer;

// Generate math question and store the correct answer
function generateQuestion() {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 + num2;
    document.getElementById('question').textContent = `What is ${num1} + ${num2}?`;
    document.getElementById('answerBox').value = '';
    document.getElementById('resultMessage').textContent = '';
}

function showTextBox(isCorrect) {
    const newTextBox = document.createElement('textarea');
    newTextBox.classList.add('newTextBox');
    newTextBox.placeholder = 'New Text Box';
    newTextBox.value = isCorrect ? 'Yes!' : 'No';
    newTextBox.style.color = isCorrect ? 'green' : 'red';
    document.getElementById('newTextBoxes').appendChild(newTextBox);
    newTextBox.focus();
}

document.getElementById('answerBox').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const userAnswer = document.getElementById('answerBox').value;
        const resultMessage = document.getElementById('resultMessage');
        const isCorrect = userAnswer == correctAnswer; // Using == to compare both numbers and strings

        resultMessage.textContent = isCorrect ? 'Yes!' : 'No';
        resultMessage.style.color = isCorrect ? 'green' : 'red';

        showTextBox(isCorrect);
        document.getElementById('answerBox').value = '';
    }
});

// Call generateQuestion to initialize the first question
generateQuestion();
