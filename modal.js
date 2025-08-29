function showPreviewModal(original, improved) {
  // Remove old modal if exists
  let oldModal = document.getElementById("aiPreviewModal");
  if (oldModal) oldModal.remove();

  let modal = document.createElement("div");
  modal.id = "aiPreviewModal";
  modal.innerHTML = `
    <div class="ai-modal-overlay"></div>
    <div class="ai-modal">
      <h2>AI Email Preview</h2>
      <label>Original:</label>
      <textarea readonly>${original}</textarea>

      <label>Improved:</label>
      <textarea id="aiImprovedBox">${improved}</textarea>

      <div class="ai-buttons">
        <button id="applyImproved">✅ Apply</button>
        <button id="cancelImproved">❌ Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Button actions
  document.getElementById("applyImproved").onclick = () => {
    let newText = document.getElementById("aiImprovedBox").value;
    let composeBox = document.querySelector('div[aria-label="Message Body"]') ||
                     document.querySelector('textarea');
    if (composeBox) {
      if (composeBox.innerHTML !== undefined) {
        composeBox.innerHTML = newText;
      } else {
        composeBox.value = newText;
      }
    }
    modal.remove();
  };

  document.getElementById("cancelImproved").onclick = () => modal.remove();
}
