class ButtonManager {
  static createButton() {
    const btn = document.createElement("button");
    btn.className = "improve-email-btn";
    btn.innerText = "AI";

    this.applyButtonStyles(btn);
    this.addHoverEffects(btn);
    this.addResizeListener(btn);

    return btn;
  }

  static addResizeListener(btn) {
    // Add window resize listener for responsive adjustments
    const resizeHandler = () => {
      this.setResponsivePosition(btn);
    };

    window.addEventListener('resize', resizeHandler);

    // Store handler for cleanup
    btn._resizeHandler = resizeHandler;
  }

  static applyButtonStyles(btn) {
    btn.style.position = "absolute";
    btn.style.zIndex = "10000";
    btn.style.width = "50px";
    btn.style.height = "50px";
    btn.style.padding = "0";
    btn.style.border = "2px solid #124170";
    btn.style.borderRadius = "50%";
    btn.style.background = "#124170";
    btn.style.color = "white";
    btn.style.cursor = "move";
    btn.style.fontSize = "15px";
    btn.style.fontWeight = "bold";
    btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    btn.style.transition = "all 0.2s ease";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.userSelect = "none";
    btn.title = "Improve Email with AI (Drag to move)";

    // Apply responsive positioning
    this.setResponsivePosition(btn);
  }

  static setResponsivePosition(btn) {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;

    // Adjust size and position based on viewport
    if (viewportWidth <= 480) {
      // Mobile/very small screens
      btn.style.width = "32px";
      btn.style.height = "32px";
      btn.style.fontSize = "10px";
      btn.style.bottom = "5px";
      btn.style.right = "5px";
    } else if (viewportWidth <= 768) {
      // Tablet/small screens
      btn.style.width = "40px";
      btn.style.height = "40px";
      btn.style.fontSize = "12px";
      btn.style.bottom = "8px";
      btn.style.right = "8px";
    } else {
      // Desktop/large screens
      btn.style.width = "50px";
      btn.style.height = "50px";
      btn.style.fontSize = "15px";
      btn.style.bottom = "10px";
      btn.style.right = "10px";
    }
  }

  static addHoverEffects(btn) {
    btn.onmouseenter = () => {
      if (!btn.isDragging) {
        btn.style.background = "#1a5a8a";
        btn.style.borderColor = "#1a5a8a";
        btn.style.transform = "scale(1.05)";
      }
    };

    btn.onmouseleave = () => {
      if (!btn.isDragging) {
        btn.style.background = "#124170";
        btn.style.borderColor = "#124170";
        btn.style.transform = "scale(1)";
      }
    };
  }

  static updateButtonState(btn, state, message = "") {
    const states = {
      loading: { bg: "#28a745", border: "#28a745", text: "⟳" },
      error: { bg: "#dc3545", border: "#dc3545", text: "!" },
      normal: { bg: "#124170", border: "#124170", text: "AI" }
    };

    const config = states[state] || states.normal;
    btn.style.background = config.bg;
    btn.style.borderColor = config.border;
    btn.innerText = config.text;

    if (message) {
      btn.title = message;
    }
  }

  static positionButton(btn, container) {
    if (container) {
      const containerStyle = globalThis.getComputedStyle(container);
      if (containerStyle.position === 'static') {
        container.style.position = "relative";
      }

      // Find the best container for positioning
      const composeContainer = this.findBestContainer(container);
      composeContainer.appendChild(btn);

      // Ensure button stays within container bounds
      this.ensureButtonVisibility(btn, composeContainer);

      console.log("Circular AI button added to compose box container");
    } else {
      document.body.appendChild(btn);
      console.log("Circular AI button added to document body");
    }
  }

  static findBestContainer(element) {
    // Look for Gmail compose dialog containers
    const composeDialog = element.closest('[role="dialog"]') ||
                         element.closest('.nH') ||
                         element.closest('.Ar') ||
                         element.closest('.aoI');

    if (composeDialog) {
      return composeDialog;
    }

    // Fallback to the immediate container
    return element.parentElement || element;
  }

  static ensureButtonVisibility(btn, container) {
    // Add resize listener to adjust button position
    const resizeObserver = new ResizeObserver(() => {
      this.adjustButtonPosition(btn, container);
    });

    resizeObserver.observe(container);

    // Store observer for cleanup
    btn._resizeObserver = resizeObserver;

    // Initial adjustment
    this.adjustButtonPosition(btn, container);
  }

  static adjustButtonPosition(btn, container) {
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Check if button is outside container bounds
    const rightEdge = Number.parseInt(btn.style.right || '10');
    const bottomEdge = Number.parseInt(btn.style.bottom || '10');

    // Adjust if button would be outside container
    if (containerRect.width < (btnRect.width + rightEdge)) {
      btn.style.right = Math.max(5, containerRect.width - btnRect.width - 5) + 'px';
    }

    if (containerRect.height < (btnRect.height + bottomEdge)) {
      btn.style.bottom = Math.max(5, containerRect.height - btnRect.height - 5) + 'px';
    }
  }

  static cleanupButton(btn) {
    // Remove resize listener
    if (btn._resizeHandler) {
      window.removeEventListener('resize', btn._resizeHandler);
      delete btn._resizeHandler;
    }

    // Remove resize observer
    if (btn._resizeObserver) {
      btn._resizeObserver.disconnect();
      delete btn._resizeObserver;
    }

    // Remove button from DOM
    if (btn.parentElement) {
      btn.remove();
    }
  }
}
