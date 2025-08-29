// Inject "✨ Improve Email" button
function injectButton() {
  let composeBox = document.querySelector('div[aria-label="Message Body"]') ||
                   document.querySelector('textarea'); // fallback for Zimbra

  if (composeBox && !document.getElementById("improveBtn")) {
    let btn = document.createElement("button");
    btn.innerText = "✨ Improve Email";
    btn.id = "improveBtn";
    btn.style.margin = "8px";
    btn.style.padding = "6px 12px";
    btn.style.borderRadius = "6px";
    btn.style.background = "#30C5E0";
    btn.style.color = "white";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      let text = composeBox.innerHTML || composeBox.value;
      chrome.runtime.sendMessage({ action: "improve", text: text });
    };

    composeBox.parentElement.appendChild(btn);
  }
}

// MutationObserver (instead of setInterval)
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });

// Listen for improved text
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "preview") {
    showPreviewModal(msg.original, msg.improved);
  }
});
