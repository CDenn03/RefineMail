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
  
  static handleButtonClick(composeBox, button) {
    const text = this.extractText(composeBox);
    this.logMessageContent(text, composeBox, "Button");
    
    if (!text.trim()) {
      alert("Please write some text in the email before improving it.");
      return;
    }
    
    showStyleSelectionModal(text, composeBox);
  }
  
  static handlePopupTrigger() {
    const detector = new ComposeDetector();
    const activeComposeBox = detector.findActiveComposeBox();
    const text = this.extractText(activeComposeBox);
    
    this.logMessageContent(text, activeComposeBox, "Popup");
    
    if (!text.trim()) {
      alert("Please write some text in the email before improving it.");
      return;
    }
    

    showStyleSelectionModal(text, activeComposeBox);
  }
  
  static setupMessageListener() {
    if (!chrome.runtime?.id) {
      console.log("Extension context invalidated, skipping message listener setup.");
      return;
    }
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "triggerImprove") {
        this.handlePopupTrigger();
      }
    });
  }
}