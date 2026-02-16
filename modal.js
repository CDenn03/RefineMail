function showStyleSelectionModal(originalText, composeBox) {
  if (!chrome.runtime?.id) {
    alert("Extension needs to be refreshed. Please reload the page and try again.");
    return;
  }

  // Validate email content before showing modal
  if (!originalText || originalText.trim().length === 0) {
    alert("Please write some text in the email before improving it.");
    return;
  }

  if (originalText.length > 3000) {
    alert("Email content is too long (max 3000 characters). Please shorten your email and try again.");
    return;
  }

  const detector = new ComposeDetector();
  const emailContent = detector.getEmailContent(composeBox);

  if (!emailContent.body || emailContent.body.trim().length === 0) {
  alert("Please write some text in the email before improving it.");
  return;
}

  let oldModal = document.getElementById("aiStyleModal");
  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "aiStyleModal";
  modal.className = "ai-modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "ai-modal";

  const title = document.createElement("h2");
  title.textContent = "AI Email Improver";

  const subjectLabel = document.createElement("label");
  subjectLabel.textContent = "Subject:";

  const subjectInput = document.createElement("input");
  subjectInput.type = "text";
  subjectInput.readOnly = true;
  subjectInput.value = emailContent.subject || '';
  subjectInput.placeholder = '(No subject)';
  subjectInput.style.marginBottom = "10px";

  const bodyLabel = document.createElement("label");
  bodyLabel.textContent = `Message Body (${originalText.length}/3000 characters):`;

  const originalTextarea = document.createElement("textarea");
  originalTextarea.readOnly = true;
  originalTextarea.value = originalText;
  originalTextarea.style.height = "100px";

  const styleLabel = document.createElement("label");
  styleLabel.textContent = "Choose a style:";
  styleLabel.style.fontWeight = "bold";

  const styleSelect = document.createElement("select");
  styleSelect.id = "styleSelect";
  const styles = ["Formal", "Friendly", "Concise", "Persuasive", "Apologetic", "Casual", "Neutral/Professional"];
  styles.forEach(style => {
    const option = document.createElement("option");
    option.value = style;
    option.textContent = style;
    styleSelect.appendChild(option);
  });

  const styleDescriptions = {
    "Formal": "Professional, structured, respectful tone",
    "Friendly": "Warm, approachable, conversational",
    "Concise": "Brief, direct, essential information only",
    "Persuasive": "Compelling, action-oriented, convincing",
    "Apologetic": "Regretful, understanding, solution-focused",
    "Casual": "Relaxed, informal, natural language",
    "Neutral/Professional": "Balanced, clear, business-appropriate"
  };

  const styleDescription = document.createElement("div");
  styleDescription.id = "styleDescription";
  styleDescription.style.fontSize = "0.9em";
  styleDescription.style.color = "#666";
  styleDescription.style.marginBottom = "10px";
  styleDescription.textContent = styleDescriptions[styleSelect.value];

  styleSelect.addEventListener('change', () => {
    styleDescription.textContent = styleDescriptions[styleSelect.value];
  });

  const instructionLabel = document.createElement("label");
  instructionLabel.textContent = "Custom instructions (optional):";

  const instructionTextarea = document.createElement("textarea");
  instructionTextarea.id = "customInstruction";
  instructionTextarea.placeholder = "e.g. make it urgent but polite";
  instructionTextarea.style.height = "60px";

  const warningDiv = document.createElement("div");
  warningDiv.style.fontSize = "0.85em";
  warningDiv.style.color = "#e74c3c";
  warningDiv.style.marginBottom = "10px";
  warningDiv.style.display = "none";
  warningDiv.id = "validationWarning";

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
  modalContent.appendChild(styleDescription);
  modalContent.appendChild(instructionLabel);
  modalContent.appendChild(instructionTextarea);
  modalContent.appendChild(warningDiv);
  modalContent.appendChild(buttonsDiv);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  try {
    if (chrome.storage?.sync && chrome.runtime?.id) {
      chrome.storage.sync.get(["preset", "instruction"], (res) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (res.preset && styles.includes(res.preset)) {
          styleSelect.value = res.preset;
          styleDescription.textContent = styleDescriptions[res.preset];
        }
        if (res.instruction) instructionTextarea.value = res.instruction;
      });
    }
  } catch (error) {
    // Silent fail
  }

  let isProcessing = false;

  improveBtn.onclick = () => {
    if (improveBtn.disabled) return;
    if (isProcessing) return;
    isProcessing = true;

    const selectedStyle = styleSelect.value;
    const customInstruction = instructionTextarea.value.trim();

    const validStyles = ["Formal", "Friendly", "Concise", "Persuasive", "Apologetic", "Casual", "Neutral/Professional"];
    if (!validStyles.includes(selectedStyle)) {
      warningDiv.textContent = "Please select a valid style.";
      warningDiv.style.display = "block";
      isProcessing = false;
      return;
    }

    const bannedInstructions = [
      'write a new', 'create a new', 'generate a new', 'add examples', 
      'include examples', 'make up', 'invent', 'create content'
    ];
    
    const hasNewContentRequest = bannedInstructions.some(banned => 
      customInstruction.toLowerCase().includes(banned)
    );
    
    if (hasNewContentRequest) {
      warningDiv.textContent = "Instructions cannot request new content creation. Please focus on style changes only.";
      warningDiv.style.display = "block";
      isProcessing = false;
      return;
    }

    warningDiv.style.display = "none";

    if (!chrome.runtime?.id) {
      alert("Extension needs to be refreshed. Please reload the page and try again.");
      modal.remove();
      isProcessing = false;
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
      // Silent fail
    }

    improveBtn.classList.add("loading");
    improveBtn.disabled = true;

    try {
      chrome.runtime.sendMessage({
        action: "improve",
        subject: emailContent.subject,
        text: originalText,
        style: selectedStyle,
        instruction: customInstruction || null
      }, (response) => {
        if (chrome.runtime.lastError) {
          if (chrome.runtime.lastError.message?.includes("Extension context invalidated")) {
            alert("Extension needs to be refreshed. Please reload the page and try again.");
            modal.remove();
          } else {
            improveBtn.textContent = "Error - Try Again";
            improveBtn.disabled = false;
            isProcessing = false;
          }
        } else {
          modal.remove();
        }
      });
    } catch (error) {
      alert("Extension needs to be refreshed. Please reload the page and try again.");
      modal.remove();
      isProcessing = false;
    }
  };

  cancelBtn.onclick = () => {
    modal.remove();
  };
}

function showPreviewModal(original, improved, composeBox) {
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
  originalSubjectInput.value = original.subject || '';
  originalSubjectInput.placeholder = '(No subject)';
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
  improvedSubjectInput.placeholder = '(No subject)';
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
    const newSubject = improvedSubjectInput.value.trim();
    const newBody = improvedTextarea.value;

    // Use the passed composeBox reference instead of querying again
    if (composeBox) {
      if (composeBox.tagName === "DIV") {
        composeBox.innerText = newBody;
        composeBox.dispatchEvent(new Event('input', { bubbles: true }));
        composeBox.dispatchEvent(new Event('keyup', { bubbles: true }));
      } else {
        composeBox.value = newBody;
      }
    }

    const subjectBox =
      document.querySelector('input[name="subjectbox"]') ||
      document.querySelector('input[aria-label="Subject"]');

    if (subjectBox && newSubject) {
      subjectBox.value = newSubject;
      subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
      subjectBox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    modal.remove();
  };

  cancelBtn.onclick = () => modal.remove();
}