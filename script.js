const chatToggle = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

let hasGreeted = false;

chatToggle.addEventListener("click", () => {
  chatBox.classList.toggle("hidden");

  if (!hasGreeted) {
    addMessage("Hey buddy! I'm the mini version of Ajay to answer questions about  his skills, projects, and background. Ask me anything! lets go through his profile", "bot");
    hasGreeted = true;
  }
});

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${sender}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    addMessage(data.reply || data.error || "Something went wrong.", "bot");
  } catch (err) {
    addMessage("Couldn't reach the server. Try again.", "bot");
  }
}

chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
