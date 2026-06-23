const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const messages = document.querySelector("#messages");
const statusLabel = document.querySelector("#status");
const tryNowButton = document.querySelector("#tryNowButton");
const aboutTryButton = document.querySelector("#aboutTryButton");

function openChatbot() {
  document.querySelector("#chatbot").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => input.focus(), 450);
}

tryNowButton.addEventListener("click", openChatbot);
aboutTryButton.addEventListener("click", openChatbot);

function setStatus(text, state = "") {
  statusLabel.textContent = text;
  statusLabel.className = `status ${state}`.trim();
}

function addMessage(role, text, source) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const sourceLabel = document.createElement("span");
  sourceLabel.className = "source";
  sourceLabel.textContent = source;

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  bubble.append(sourceLabel, paragraph);
  article.appendChild(bubble);
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) {
    input.focus();
    return;
  }

  input.value = "";
  input.disabled = true;
  form.querySelector("button").disabled = true;
  setStatus("Thinking", "busy");
  addMessage("user", message, "You");

  try {
    const data = await sendMessage(message);
    addMessage("bot", data.answer, data.source || "Bot");
    setStatus("Ready");
  } catch (error) {
    addMessage("bot", error.message, "System");
    setStatus("Error", "error");
  } finally {
    input.disabled = false;
    form.querySelector("button").disabled = false;
    input.focus();
  }
});
