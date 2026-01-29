class ButtonManager {
  static createButton() {
    const btn = document.createElement("button");
    btn.className = "improve-email-btn";
    btn.innerText = "AI";
    
    this.applyButtonStyles(btn);
    this.addHoverEffects(btn);
    
    return btn;
  }
  
  static applyButtonStyles(btn) {
    btn.style.position = "absolute";
    btn.style.bottom = "10px";
    btn.style.right = "60px";
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
      container.appendChild(btn);
      console.log("Circular AI button added to compose box container");
    } else {
      document.body.appendChild(btn);
      console.log("Circular AI button added to document body");
    }
  }
}