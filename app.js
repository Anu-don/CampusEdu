// ── Markdown renderer (marked via CDN, loaded in index.html) ──────────────────
function renderMarkdown(text) {
  if (typeof marked !== "undefined") {
    return marked.parse(text);
  }
  // Fallback: escape HTML and preserve line breaks
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

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

  const content = document.createElement("div");
  content.className = "bubble-content";

  if (role === "bot") {
    // Render markdown for bot messages
    content.innerHTML = renderMarkdown(text);
  } else {
    // Plain text for user messages
    const p = document.createElement("p");
    p.textContent = text;
    content.appendChild(p);
  }

  bubble.append(sourceLabel, content);
  article.appendChild(bubble);
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}

function showLoading() {
  addMessage("bot", "🤖 Thinking...", "System");
}

function hideLoading() {
  const loadingMessages = document.querySelectorAll(".message.bot");
  const lastMessage = loadingMessages[loadingMessages.length - 1];
  if (lastMessage) {
    const text = lastMessage.querySelector("p");
    if (text && text.textContent === "🤖 Thinking...") {
      lastMessage.remove();
    }
    // Also check bubble-content
    const content = lastMessage.querySelector(".bubble-content");
    if (content && content.textContent.trim() === "🤖 Thinking...") {
      lastMessage.remove();
    }
  }
}

async function sendMessage(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) { input.focus(); return; }

  input.value = "";
  input.disabled = true;
  form.querySelector("button").disabled = true;
  setStatus("Thinking", "busy");
  addMessage("user", message, "You");
  showLoading();

  try {
    const data = await sendMessage(message);
    hideLoading();
    addMessage("bot", data.answer, data.source || "Bot");
    setStatus("Ready");
  } catch (error) {
    hideLoading();
    addMessage("bot", error.message, "System");
    setStatus("Error", "error");
  } finally {
    input.disabled = false;
    form.querySelector("button").disabled = false;
    input.focus();
  }
});
