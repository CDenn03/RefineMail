class ContentMain {
  constructor() {
    this.detector = new ComposeDetector();
    this.buttonInstances = new Map(); 
    this.dragHandlers = new Map();
    this.activeComposeBox = null; // Store reference to active compose box
  }
  
  initialize() {
    if (!chrome.runtime?.id) {
      return;
    }

    MessageHandler.setupMessageListener();
    this.setupBackgroundMessageListener();
    
    this.startWatching();
  }
  
  setupBackgroundMessageListener() {
    if (!chrome.runtime?.id) {
      return;
    }
    
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "preview") {
        // Use stored composeBox reference or fallback to finding it
        const composeBox = this.activeComposeBox || 
          document.querySelector('div[aria-label="Message Body"]') ||
          document.querySelector("textarea");
        showPreviewModal(message.original, message.improved, composeBox);
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
      return;
    }
    
    const container = this.detector.findBestContainer(composeBox);
    const existingButton = container?.querySelector('.improve-email-btn');
    if (existingButton) {
      return;
    }
    
    const button = ButtonManager.createButton();
    const dragHandler = new DragHandler(button);
    
    button.addEventListener('aiButtonClick', () => {
      this.activeComposeBox = composeBox; // Store reference before handling click
      MessageHandler.handleButtonClick(composeBox, button);
    });
    
    ButtonManager.positionButton(button, container);
    
    this.buttonInstances.set(composeBox, button);
    this.dragHandlers.set(composeBox, dragHandler);
  }
  
  cleanup() {
    this.detector.stopWatching();

    this.dragHandlers.forEach((dragHandler) => {
      if (typeof dragHandler.cleanup === 'function') {
        dragHandler.cleanup();
      }
    });
    

    this.buttonInstances.forEach((button) => {
      ButtonManager.cleanupButton(button);
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