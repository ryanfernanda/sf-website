const form = document.getElementById('sf-form');
const inputs = form.querySelectorAll('input');
const button = form.querySelector('button');
const textElement = document.getElementById('changingText');
const textArray = [
    'Try it down below!',
    'It\'s easy, free and reliable',
    'Insert your input variables and predict down below'];
let arrayIndex = 0;
let charIndex = 0;
let typingSpeed = 35;
let newTextDelay = 7000; // Delay before new text starts typing

function type() {
    if (charIndex < textArray[arrayIndex].length) {
        textElement.innerHTML = '<i>' + textArray[arrayIndex].substring(0, charIndex + 1) + '</i>';
        charIndex++;
        setTimeout(type, typingSpeed);
    } else {
        // Start typing the next sentence after a delay
        setTimeout(nextText, newTextDelay);
    }
}

function nextText() {
    // Move to the next sentence
    arrayIndex = (arrayIndex + 1) % textArray.length; // Switch to next sentence
    charIndex = 0; // Reset charIndex to start typing the new sentence
    type(); // Start typing the new sentence
}

// Start the typing effect
document.addEventListener('DOMContentLoaded', function() {
    type(); // Start typing immediately
});

// Function to check if all inputs are filled
function checkInputs() {
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value === '') {
            allFilled = false;
        }
    });

    if (allFilled) {
        button.disabled = false;
        button.classList.add('active'); // Adds black color and white text
    } else {
        button.disabled = true;
        button.classList.remove('active');
    }
}

// Attach the checkInputs function to the input event for all inputs
inputs.forEach(input => {
    input.addEventListener('input', checkInputs);
});

// Function to replace commas with decimal points
function replaceCommaWithPoint(event) {
    const input = event.target;
    input.value = input.value.replace(',', '.'); // Replace comma with point
}

// Attach the checkInputs and replaceCommaWithPoint functions to the input event for all inputs
inputs.forEach(input => {
    input.addEventListener('input', checkInputs);
    input.addEventListener('input', replaceCommaWithPoint); // Add this listener to replace commas
    input.addEventListener('input', updateOverlayValues);
});

document.getElementById('sf-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  fetch('/', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const sfValueElement = document.getElementById('sf-value');
    const sfStatusElement = document.getElementById('sf-status');
    const resultSpan = sfValueElement.parentElement;

    if (data.sf !== '--') {
      const sfValue = parseFloat(data.sf);
      sfValueElement.textContent = sfValue;

      // Determine color and status based on the value of sf
      if (sfValue < 1.5) {
        sfValueElement.style.color = 'orange';
        sfStatusElement.textContent = '— Not Safe';
        sfStatusElement.style.color = 'orange';
      } else if (sfValue >= 1.5 && sfValue <= 3.0) {
        sfValueElement.style.color = 'green';
        sfStatusElement.textContent = '— Safe';
        sfStatusElement.style.color = 'green';
      } else {
        sfValueElement.style.color = 'blue';
        sfStatusElement.textContent = '— Over Conservative';
        sfStatusElement.style.color = 'blue';
      }

      resultSpan.classList.remove('grey');
      resultSpan.classList.add('black');
      
      // Add the new prediction to the list
      addPrediction(
        formData.get('pga'),
        formData.get('b'),
        formData.get('df'),
        formData.get('y'),
        formData.get('p'),
        data.sf
      );
    } else {
      sfValueElement.textContent = '--';
      sfValueElement.style.color = ''; // Reset to default color
      sfStatusElement.textContent = '';
      resultSpan.classList.remove('black');
      resultSpan.classList.add('grey');
    }
  })
  .catch(error => console.error('Error:', error));
});


function updateOverlayValues() {
  const inputs = ['pga', 'b', 'df', 'y', 'p'];
  let allFilled = true;
  
  inputs.forEach(input => {
    const value = document.querySelector(`input[name="${input}"]`).value;
    const overlayElement = document.getElementById(`${input}-value`);
    
    if (value) {
      overlayElement.textContent = `${value} ${getUnit(input)}`;
      overlayElement.style.opacity = '1';
    } else {
      overlayElement.style.opacity = '0';
      allFilled = false;
    }
  });
  
  document.getElementById('foundation-image').style.filter = allFilled ? 'none' : 'grayscale(100%)';
  updateProgressTrack(allFilled ? 2 : 1);
}

function getUnit(input) {
  const units = {
    pga: 'g',
    b: 'm',
    df: 'm',
    y: 'kN/m3',
    p: 'kN'
  };
  return units[input] || '';
}

let predictions = [];

function addPrediction(pga, b, df, y, p, sf) {
  predictions.push({ pga, b, df, y, p, sf });
  updatePredictionsList();
}

function updatePredictionsList() {
    const listElement = document.getElementById('predictions-list');
    listElement.innerHTML = '';
    
    // Create a reversed copy of the predictions array
    const reversedPredictions = [...predictions].reverse();
    
    reversedPredictions.forEach((pred, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${predictions.length - index}</td>
        <td>${pred.pga}</td>
        <td>${pred.b}</td>
        <td>${pred.df}</td>
        <td>${pred.y}</td>
        <td>${pred.p}</td>
        <td>${pred.sf}</td>
        <td><span class="delete-btn" onclick="deletePrediction(${predictions.length - index - 1})" aria-label="Delete">Delete</span></td>
      `;
      // Set the height for each cell to ensure consistency
      row.querySelectorAll('td').forEach(cell => {
        cell.style.height = '25px';
        cell.style.lineHeight = '25px'; // This helps with vertical alignment
      });
      listElement.appendChild(row);
    });
}

function deletePrediction(index) {
  predictions.splice(index, 1);
  updatePredictionsList();
}

function downloadCSV() {
  let csv = 'Index,PGA(g),B(m),DF(m),Y(kN/m3),P(kN),SF\n';
  predictions.forEach((pred, index) => {
    csv += `${index + 1},${pred.pga},${pred.b},${pred.df},${pred.y},${pred.p},${pred.sf}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, 'predictions.csv');
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = 'predictions.csv';
    link.click();
  }
}

// Add event listener for the download button
document.getElementById('download-csv').addEventListener('click', downloadCSV);

// Add event listener for page unload
window.addEventListener('beforeunload', function (e) {
  if (predictions.length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});