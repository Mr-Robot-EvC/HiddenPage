// --- Generate Encrypted Data ---
// Instead of using require, I will define the plaintext directly and generate the encrypted data
/*
      const plaintext = `Example of a secret that needs to be encrypted.`;
      */

//const password = "Password that will we use to encypt the data.";

// Generate the encrypted data
/*
      const encryptedData = CryptoJS.AES.encrypt(
        plaintext,
        password
      ).toString();
      console.log("Data encrypted successfully");
      console.log(encryptedData)
      */

const encryptedData =
  "U2FsdGVkX1/ELWzIn8BN83D/5cMk1oPsMS69x5gU+hxdml//D4I1aMRth0L6UXb92JYDwwBilQmIh1hIbn2T64NWnblbNnUwRP1TKQSH2gpPCbEg0dljKfVlrsaeqGKyCnihhNEn99nVZXrwSmMY1uI4EpzGM+fKQmqvigSQFT+xBe1Rqv/WOFYNez2ElLAHSAXtIsyamMtn0vr0xqrZpcxwuBM/1QBcmeTu/498AF34pOf8CE3QhJqG240MZiW+wfO4CJVSWYE+tdXqPe/hngyxIsJVXZfPFKPbsX6Y4sG2fMhKAcPWuF8V4ZWwLEuIEyrhGImyKbPdK6lwihD917TWrB7fLv8Zv+wQFiZmIzo/G5lKUC9J62baKce33Vny1eBaUnfrlwWUNz4GMSWBYJg3gOj548fhK8L+JbqHecaJafxz9DEZGPCx1/fppenNV/hzxDneWOe5sRrrhy0S7POmXJlEjNW+ou7rPiqL3lSEOCzpu+BT4eMeJMy4nLoa+ZM6JpgK6N4y01h6Y8K2LwXrpxYvQP6TIlaT7eecY8NalWIvohIZLjOhCSHTMOT1c78Ug6ZZgW89IF4KzWxKyiA/qLA+stLeZ62/dBOq9WEc7AAkmGBm3oqc7UQrIrJrEbGNzZEKeAgVom2wJbSBtI/KhiNHRYVsqqd4k3rLinQWwSIcs7Ys83yEpZ0DucKINVJuQmzqMcjhc+s+Y/SYUQ==";

// --- Decryption Logic ---
const accessLog = document.getElementById("access-log");
const secretElement = document.getElementById("secret");
const pwInput = document.getElementById("pw");

function logAccess(message) {
  const p = document.createElement("p");
  p.innerHTML = message; // Use innerHTML to allow blinking cursor etc.
  accessLog.appendChild(p);
  // Auto-scroll to bottom
  accessLog.scrollTop = accessLog.scrollHeight;

  // Optional: Limit log lines to prevent excessive growth
  const maxLogLines = 15;
  while (accessLog.childElementCount > maxLogLines) {
    accessLog.removeChild(accessLog.firstElementChild);
  }
}

/*
function scrollToSecret() {
    // Scroll to the secret element
    secretElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
*/

function decrypt() {
  const pw = pwInput.value;
  if (!pw) {
    logAccess("> ERROR: Authentication token cannot be empty.");
    return;
  }

  logAccess("> Attempting decryption with provided token...");

  // Clear previous secret display if any
  secretElement.style.display = "none";
  secretElement.innerText = "";

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, pw);
    const plain = bytes.toString(CryptoJS.enc.Utf8);

    if (!plain) {
      // Decryption succeeded but resulted in empty string (unlikely with AES, but good check)
      throw new Error(
        "Decryption resulted in empty data. Potential key mismatch or data corruption."
      );
    }

    // SUCCESS
    logAccess("> Authentication successful. Access granted.");
    logAccess('> Revealing classified data... <span class="blink">_</span>');

    // Make sure links in the decrypted text are clickable
    const linkedText = plain.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Display with typewriter effect
    secretElement.style.display = "block";
    typeWriter(linkedText, secretElement, () => {
      // Optional: remove the blinking cursor from log when typing done
      const logLines = accessLog.getElementsByTagName("p");
      if (logLines.length > 0) {
        logLines[logLines.length - 1].innerHTML = logLines[
          logLines.length - 1
        ].innerHTML.replace('<span class="blink">_</span>', "");
      }
    });
  } catch (e) {
    // FAILURE
    console.error("Decryption failed:", e); // Log detailed error to console for debugging
    logAccess("> Authentication failed. Access denied.");
    logAccess("> Reason: Invalid token or corrupted data.");
    pwInput.value = ""; // Clear the password field on failure
    pwInput.focus(); // Set focus back to input
  }
}

// --- Typewriter Effect ---
function typeWriter(text, element, callback) {
  let i = 0;
  element.innerHTML = ""; // Use innerHTML for link rendering
  const speed = 25; // Typing speed in ms (slightly faster)

  function type() {
    if (i < text.length) {
      // Handle HTML tags correctly - display them instantly, don't type them out
      if (text.charAt(i) === "<") {
        let tagEnd = text.indexOf(">", i);
        if (tagEnd !== -1) {
          element.innerHTML += text.substring(i, tagEnd + 1);
          i = tagEnd; // Move index past the tag
        } else {
          // Fallback if tag is broken (shouldn't happen with the regex)
          element.innerHTML += text.charAt(i);
        }
      } else {
        element.innerHTML += text.charAt(i);
      }
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback(); // Execute callback when typing is finished

      //secretElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  type();
}

// --- Matrix Rain Effect ---
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// More varied characters + adjusted font size/columns
const matrixChars =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()*&^%+-/~{[|`]}フシソヌアセスタネムヤク";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  // Use a semi-transparent black rectangle to fade trails
  ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0"; // Green text
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    // Resetting drops randomly or when they go off screen
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

let matrixInterval = setInterval(drawMatrix, 35); // Slightly adjusted interval

// Handle window resize for canvas
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Simple redraw on resize often works okay:
  drawMatrix();
});

// --- Event Listeners ---
// Make Enter key work like clicking the button the pare
pwInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent potential form submission
    decrypt();
  }
});

// Set initial focus on the password input field
pwInput.focus();

console.log(
  "If you can see the Matrix, you can see the code. Neo is the chosen one, but he is dressed with exceptional style."
);
