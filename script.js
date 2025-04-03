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

function showTextBox() {
    const newTextBox = document.createElement('textarea');
    newTextBox.classList.add('newTextBox');
    newTextBox.placeholder = 'New Text Box';
    document.getElementById('newTextBoxes').appendChild(newTextBox);
    newTextBox.focus();
}

document.getElementById('answerBox').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const userAnswer = parseInt(document.getElementById('answerBox').value);
        const resultMessage = document.getElementById('resultMessage');
        if (userAnswer === correctAnswer) {
            resultMessage.value = 'Yes!';
            resultMessage.style.color = 'green';
        } else {
            resultMessage.value = 'No';
            resultMessage.style.color = 'red';
        }
        showTextBox();
        document.getElementById('answerBox').value = '';
    }
});
