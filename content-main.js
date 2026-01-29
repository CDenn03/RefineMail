class ContentMain {
  constructor() {
    this.detector = new ComposeDetector();
    this.buttonInstances = new Map(); 
    this.dragHandlers = new Map(); 
  }
  
  initialize() {
    console.log("AI Email Refiner: Initializing...");
    
    if (!chrome.runtime?.id) {
      console.log("Extension context invalidated. Please refresh the page.");
      return;
    }

    MessageHandler.setupMessageListener();
    this.setupBackgroundMessageListener();
    
    this.startWatching();
    console.log("AI Email Refiner: Watching for compose boxes...");
  }
  
  setupBackgroundMessageListener() {
    if (!chrome.runtime?.id) {
      console.log("Extension context invalidated, skipping message listener setup.");
      return;
    }
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "preview") {
        showPreviewModal(message.original, message.improved);
      } else if (message.action === "error") {
        alert(message.message);
      }
    });
  }
  
  startWatching() {
    this.detector.startWatching((composeBox) => {
      this.addButtonToComposeBox(composeBox);
    });
  }
  
  addButtonToComposeBox(composeBox) {
    const existingBtn = this.buttonInstances.get(composeBox);
    if (existingBtn?.parentElement) {
      console.log("Button already exists for this compose box");
      return;
    }
    
    const container = this.detector.findBestContainer(composeBox);
    const existingButton = container?.querySelector('.improve-email-btn');
    if (existingButton) {
      console.log("Button already exists in container");
      return;
    }
    
    const button = ButtonManager.createButton();
    const dragHandler = new DragHandler(button);
    
    button.addEventListener('aiButtonClick', () => {
      MessageHandler.handleButtonClick(composeBox, button);
    });
    
    ButtonManager.positionButton(button, container);
    
    this.buttonInstances.set(composeBox, button);
    this.dragHandlers.set(composeBox, dragHandler);
    
    console.log("Circular AI button added to compose box:", composeBox);
  }
  
  cleanup() {
    this.detector.stopWatching();
    
    this.dragHandlers.forEach((dragHandler) => {
      if (typeof dragHandler.cleanup === 'function') {
        dragHandler.cleanup();
      }
    });
    
    this.buttonInstances.clear();
    this.dragHandlers.clear();
  }
}

function initializeExtension() {
  const contentMain = new ContentMain();
  contentMain.initialize();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

setTimeout(initializeExtension, 2000);