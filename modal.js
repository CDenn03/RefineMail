function showStyleSelectionModal(originalText, composeBox) {
  console.log("showStyleSelectionModal called with text:", originalText);

  if (!chrome.runtime?.id) {
    alert("Extension needs to be refreshed. Please reload the page and try again.");
    return;
  }

  const detector = new ComposeDetector();
  const emailContent = detector.getEmailContent(composeBox);

  let oldModal = document.getElementById("aiStyleModal");
  if (oldModal) {
    console.log("Removing old modal");
    oldModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "aiStyleModal";
  modal.className = "ai-modal-overlay";

  console.log("Created modal element:", modal);

  const modalContent = document.createElement("div");
  modalContent.className = "ai-modal";

  console.log("Created modal content:", modalContent);

  const title = document.createElement("h2");
  title.textContent = "AI Email Improver";

  const subjectLabel = document.createElement("label");
  subjectLabel.textContent = "Subject:";

  const subjectInput = document.createElement("input");
  subjectInput.type = "text";
  subjectInput.readOnly = true;
  subjectInput.value = emailContent.subject || '(No subject)';
  subjectInput.style.marginBottom = "10px";

  const bodyLabel = document.createElement("label");
  bodyLabel.textContent = "Message Body:";

  const originalTextarea = document.createElement("textarea");
  originalTextarea.readOnly = true;
  originalTextarea.value = originalText;
  originalTextarea.style.height = "100px";

  const styleLabel = document.createElement("label");
  styleLabel.textContent = "Choose a style:";

  const styleSelect = document.createElement("select");
  styleSelect.id = "styleSelect";
  const styles = ["Formal", "Friendly", "Concise", "Persuasive", "Apologetic", "Casual", "Neutral/Professional"];
  styles.forEach(style => {
    const option = document.createElement("option");
    option.value = style;
    option.textContent = style;
    styleSelect.appendChild(option);
  });

  const instructionLabel = document.createElement("label");
  instructionLabel.textContent = "Custom instructions (optional):";

  const instructionTextarea = document.createElement("textarea");
  instructionTextarea.id = "customInstruction";
  instructionTextarea.placeholder = "e.g. make it urgent but polite";
  instructionTextarea.style.height = "60px";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "ai-buttons";

  const improveBtn = document.createElement("button");
  improveBtn.id = "improveBtn";
  improveBtn.textContent = "Improve Email";

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelBtn";
  cancelBtn.textContent = "Cancel";

  buttonsDiv.appendChild(improveBtn);
  buttonsDiv.appendChild(cancelBtn);

  modalContent.appendChild(title);
  modalContent.appendChild(subjectLabel);
  modalContent.appendChild(subjectInput);
  modalContent.appendChild(bodyLabel);
  modalContent.appendChild(originalTextarea);
  modalContent.appendChild(styleLabel);
  modalContent.appendChild(styleSelect);
  modalContent.appendChild(instructionLabel);
  modalContent.appendChild(instructionTextarea);
  modalContent.appendChild(buttonsDiv);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  console.log("Modal added to document body. Modal in DOM:", document.getElementById("aiStyleModal"));

  modal.onclick = (e) => {
    if (e.target === modal) {
      console.log("Closing modal via overlay click");
      modal.remove();
    }
  };

  try {
    if (chrome.storage?.sync && chrome.runtime?.id) {
      chrome.storage.sync.get(["preset", "instruction"], (res) => {
        if (chrome.runtime.lastError) {
          console.log("Could not load saved preferences:", chrome.runtime.lastError);
          return;
        }
        if (res.preset) styleSelect.value = res.preset;
        if (res.instruction) instructionTextarea.value = res.instruction;
      });
    } else {
      console.log("Chrome storage not available in this context");
    }
  } catch (error) {
    console.log("Extension context error when loading preferences:", error);
  }

  improveBtn.onclick = () => {
    const selectedStyle = styleSelect.value;
    const customInstruction = instructionTextarea.value;

    console.log("Improve button clicked with style:", selectedStyle, "instruction:", customInstruction);

    if (!chrome.runtime?.id) {
      alert("Extension needs to be refreshed. Please reload the page and try again.");
      modal.remove();
      return;
    }

    try {
      if (chrome.storage?.sync && chrome.runtime?.id) {
        chrome.storage.sync.set({
          preset: selectedStyle,
          instruction: customInstruction
        });
      }
    } catch (error) {
      console.log("Extension context error when saving preferences:", error);
    }

    improveBtn.textContent = "Improving...";
    improveBtn.disabled = true;

    try {
      chrome.runtime.sendMessage({
        action: "improve",
        subject: emailContent.subject,
        text: emailContent.body,
        style: selectedStyle,
        instruction: customInstruction
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          if (chrome.runtime.lastError.message?.includes("Extension context invalidated")) {
            alert("Extension needs to be refreshed. Please reload the page and try again.");
            modal.remove();
          } else {
            improveBtn.textContent = "Error - Try Again";
            improveBtn.disabled = false;
          }
        } else {
          console.log("Message sent successfully, closing modal");
          modal.remove();
        }
      });
    } catch (error) {
      console.error("Extension context error:", error);
      alert("Extension needs to be refreshed. Please reload the page and try again.");
      modal.remove();
    }
  };

  cancelBtn.onclick = () => {
    console.log("Cancel button clicked");
    modal.remove();
  };
}

function showPreviewModal(original, improved) {
  let oldModal = document.getElementById("aiPreviewModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "aiPreviewModal";
  modal.className = "ai-modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "ai-modal";

  const title = document.createElement("h2");
  title.textContent = "AI Email Preview";

  const originalLabel = document.createElement("label");
  originalLabel.textContent = "Original:";

  const originalSubjectLabel = document.createElement("label");
  originalSubjectLabel.textContent = "Subject:";
  originalSubjectLabel.style.fontSize = "0.9em";
  originalSubjectLabel.style.marginTop = "5px";

  const originalSubjectInput = document.createElement("input");
  originalSubjectInput.type = "text";
  originalSubjectInput.readOnly = true;
  originalSubjectInput.value = original.subject || '(No subject)';
  originalSubjectInput.style.marginBottom = "10px";

  const originalTextarea = document.createElement("textarea");
  originalTextarea.readOnly = true;
  originalTextarea.value = original.body || original; 


  const improvedLabel = document.createElement("label");
  improvedLabel.textContent = "Improved:";

  const improvedSubjectLabel = document.createElement("label");
  improvedSubjectLabel.textContent = "Subject:";
  improvedSubjectLabel.style.fontSize = "0.9em";
  improvedSubjectLabel.style.marginTop = "5px";

  const improvedSubjectInput = document.createElement("input");
  improvedSubjectInput.type = "text";
  improvedSubjectInput.id = "aiImprovedSubject";
  improvedSubjectInput.value = improved.subject || original.subject || '';
  improvedSubjectInput.style.marginBottom = "10px";

  const improvedTextarea = document.createElement("textarea");
  improvedTextarea.id = "aiImprovedBox";
  improvedTextarea.value = improved.body || improved; 


  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "ai-buttons";

  const applyBtn = document.createElement("button");
  applyBtn.id = "applyImproved";
  applyBtn.textContent = "Apply";

  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelImproved";
  cancelBtn.textContent = "Cancel";

  buttonsDiv.appendChild(applyBtn);
  buttonsDiv.appendChild(cancelBtn);


  modalContent.appendChild(title);
  modalContent.appendChild(originalLabel);
  modalContent.appendChild(originalSubjectLabel);
  modalContent.appendChild(originalSubjectInput);
  modalContent.appendChild(originalTextarea);
  modalContent.appendChild(improvedLabel);
  modalContent.appendChild(improvedSubjectLabel);
  modalContent.appendChild(improvedSubjectInput);
  modalContent.appendChild(improvedTextarea);
  modalContent.appendChild(buttonsDiv);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  applyBtn.onclick = () => {
    const newSubject = improvedSubjectInput.value;
    const newBody = improvedTextarea.value;

    const composeBox =
      document.querySelector('div[aria-label="Message Body"]') ||
      document.querySelector("textarea");

    if (composeBox) {
      if (composeBox.tagName === "DIV") {
        composeBox.innerText = newBody;
      } else {
        composeBox.value = newBody;
      }
    }

    const subjectBox =
      document.querySelector('input[name="subjectbox"]') ||
      document.querySelector('input[aria-label="Subject"]');

    if (subjectBox) {
      subjectBox.value = newSubject;
      subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
      subjectBox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    modal.remove();
  };

  cancelBtn.onclick = () => modal.remove();
}
