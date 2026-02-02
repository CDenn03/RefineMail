class MessageHandler {
  static extractText(composeBox) {
    return composeBox ? (composeBox.innerText || composeBox.textContent || "") : "";
  }
  
  static logMessageContent(text, composeBox, source = "Button") {
    console.log(`AI Email Refiner - ${source} Triggered`);
    console.log("Compose box element:", composeBox);
    console.log("Captured text length:", text.length);
    console.log("Captured message content:", text);
  }
  
  static validateEmailContent(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: "Please write some text in the email before improving it." };
    }
    
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: "Please write some text in the email before improving it." };
    }
    
    if (trimmed.length > 3000) {
      return { valid: false, error: "Email content is too long (max 3000 characters). Please shorten your email and try again." };
    }
    
    return { valid: true };
  }
  
  static handleButtonClick(composeBox, button) {
    const text = this.extractText(composeBox);
    this.logMessageContent(text, composeBox, "Button");
    
    const validation = this.validateEmailContent(text);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    showStyleSelectionModal(text, composeBox);
  }
  
  static handlePopupTrigger() {
    const detector = new ComposeDetector();
    const activeComposeBox = detector.findActiveComposeBox();
    const text = this.extractText(activeComposeBox);
    
    this.logMessageContent(text, activeComposeBox, "Popup");
    
    const validation = this.validateEmailContent(text);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    showStyleSelectionModal(text, activeComposeBox);
  }
  
  static handleGetEmailContent(sendResponse) {
    const detector = new ComposeDetector();
    const activeComposeBox = detector.findActiveComposeBox();
    
    if (!activeComposeBox) {
      sendResponse({ hasEmail: false });
      return;
    }
    
    const emailContent = detector.getEmailContent(activeComposeBox);
    const bodyText = this.extractText(activeComposeBox);
    const wordCount = bodyText.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    const validation = this.validateEmailContent(bodyText);
    
    sendResponse({
      hasEmail: true,
      subject: emailContent.subject || "",
      body: bodyText,
      wordCount: wordCount,
      isValid: validation.valid,
      validationError: validation.valid ? null : validation.error
    });
  }
  
  static setupMessageListener() {
    if (!chrome.runtime?.id) {
      console.log("Extension context invalidated, skipping message listener setup.");
      return;
    }
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "triggerImprove") {
        this.handlePopupTrigger();
      } else if (message.action === "getEmailContent") {
        this.handleGetEmailContent(sendResponse);
        return true; 
      }
    });
  }
}