class ComposeDetector {
  observer = null;
  selectors = [
    'div[aria-label="Message Body"][contenteditable="true"]',
    'div[contenteditable="true"][aria-label*="Message"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"][data-message-id]',
    '.Am.Al.editable'
  ];
  
  startWatching(callback) {
    this.observer = new MutationObserver((mutations) => {
      this.checkForComposeBoxes(callback);
    });

    this.observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'contenteditable']
    });
    
    this.checkForComposeBoxes(callback);
    setTimeout(() => this.checkForComposeBoxes(callback), 1000);
    setTimeout(() => this.checkForComposeBoxes(callback), 3000);
  }
  
  checkForComposeBoxes(callback) {
    this.selectors.forEach(selector => {
      const composeBoxes = document.querySelectorAll(selector);
      composeBoxes.forEach((box) => {
        if (this.isComposeBox(box)) {
          callback(box);
        }
      });
    });
  }
  
  isComposeBox(element) {
    const parent = element.closest('[role="dialog"], .nH, .Ar, .aoI');
    const hasComposeIndicators = element.getAttribute('aria-label')?.includes('Message') ||
                                element.closest('[aria-label*="compose"], [aria-label*="Compose"]') ||
                                element.closest('.M9') ||
                                element.closest('.aoI'); 
    
    return parent && hasComposeIndicators;
  }
  
  findActiveComposeBox() {
    const focusedSelectors = [
      'div[aria-label="Message Body"][contenteditable="true"]:focus',
      'div[aria-label="Message Body"][contenteditable="true"]',
      'div[contenteditable="true"][aria-label*="Message"]:focus',
      'div[contenteditable="true"][aria-label*="Message"]'
    ];
    
    for (const selector of focusedSelectors) {
      const activeBox = document.querySelector(selector);
      if (activeBox && this.isComposeBox(activeBox)) {
        return activeBox;
      }
    }
    
    return null;
  }
  
  findBestContainer(composeBox) {
    return composeBox.closest('[role="dialog"]') || 
           composeBox.closest('.nH') ||
           composeBox.closest('.Ar') ||
           composeBox.closest('.aoI') ||
           composeBox.parentElement;
  }
  
  stopWatching() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}