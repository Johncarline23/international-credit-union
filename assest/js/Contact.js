/* ========== LIVE CHAT SYSTEM ========== */

const chatBtn = document.getElementById("chat-btn");
const chatBox = document.getElementById("chat-box");
const closeBtn = document.getElementById("close-chat");

const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("chat-messages");

/* Open chat */

chatBtn.addEventListener("click", () => {
  chatBox.style.display = "flex";
});

/* Close chat */

closeBtn.addEventListener("click", () => {
  chatBox.style.display = "none";
});

/* Send message */

function sendMessage() {
  const text = input.value.trim();

  if (text === "") return;

  /* User message */

  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerText = text;

  messages.appendChild(userMsg);

  input.value = "";

  messages.scrollTop = messages.scrollHeight;

  /* Auto reply */

  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "support");

    botMsg.innerText =
      "Thank you for contacting International Credit Union. A support agent will assist you shortly.";

    messages.appendChild(botMsg);

    messages.scrollTop = messages.scrollHeight;
  }, 1200);
}

/* Button click */

sendBtn.addEventListener("click", sendMessage);

/* Enter key */

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

/* ========== CONTACT FORM SUBMISSION ========== */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Message sent successfully!');
                contactForm.reset();
            } else {
                alert('Failed to send message.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    });
}
