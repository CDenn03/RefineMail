function addImproveButton(composeBox) {
  // Avoid duplicates
  if (document.getElementById("improveBtn")) return;

  // Create a full-width toolbar row
  let toolbar = document.createElement("div");
  toolbar.style.display = "flex";
  toolbar.style.justifyContent = "flex-end"; // push button to right
  toolbar.style.alignItems = "center";
  toolbar.style.width = "100%"; // full width of compose area
  toolbar.style.padding = "6px 8px";
  toolbar.style.boxSizing = "border-box";

  let btn = document.createElement("button");
  btn.innerText = "✨ Improve Email";
  btn.id = "improveBtn";

  // Styling
  btn.style.padding = "6px 12px";
  btn.style.border = "none";
  btn.style.borderRadius = "6px";
  btn.style.background = "#124170";
  btn.style.color = "white";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "0.85em";
  btn.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";

  btn.onclick = () => {
    let text = composeBox.innerText || "";
    chrome.runtime.sendMessage({ action: "improve", text });
  };

  toolbar.appendChild(btn);

  // Insert the toolbar *before* the compose box
  composeBox.parentElement.insertBefore(toolbar, composeBox);
}

function watchComposeBoxes() {
  const observer = new MutationObserver(() => {
    let composeBoxes = document.querySelectorAll(
      'div[aria-label="Message Body"][contenteditable="true"]'
    );
    composeBoxes.forEach((box) => addImproveButton(box));
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

watchComposeBoxes();
