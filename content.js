function injectButton() {
  // Gmail compose box has div[aria-label="Message Body"]
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
      let text = composeBox.innerText || composeBox.value;
      chrome.runtime.sendMessage({ action: "improve", text: text });
    };

    composeBox.parentElement.appendChild(btn);
  }
}

setInterval(injectButton, 2000); // keep trying in case UI reloads

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "replace") {
    let composeBox = document.querySelector('div[aria-label="Message Body"]') ||
                     document.querySelector('textarea');
    if (composeBox) {
      if (composeBox.innerText !== undefined) {
        composeBox.innerText = msg.text;
      } else {
        composeBox.value = msg.text;
      }
    }
  }
});
