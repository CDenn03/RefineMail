class ButtonManager {
  static createButton() {
    const btn = document.createElement("button");
    btn.className = "improve-email-btn";
    btn.innerHTML = `
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.8"
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
    <path d="M20 2v4"/>
    <path d="M22 4h-4"/>
    <circle cx="4" cy="20" r="2"/>
  </svg>
`;

    this.applyButtonStyles(btn);
    this.addResizeListener(btn);

    // Add visible class after a short delay for entrance animation
    setTimeout(() => {
      btn.classList.add('visible');
    }, 100);

    return btn;
  }

  static addResizeListener(btn) {
    const resizeHandler = () => {
      this.setResponsivePosition(btn);
    };

    window.addEventListener('resize', resizeHandler);
    btn._resizeHandler = resizeHandler;
  }

  static applyButtonStyles(btn) {
    btn.title = "Refine";
    this.setResponsivePosition(btn);
  }

  static setResponsivePosition(btn) {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 480) {
      btn.style.width = "40px";
      btn.style.height = "40px";
      btn.style.bottom = "8px";
      btn.style.right = "8px";
    } else if (viewportWidth <= 768) {
      btn.style.width = "44px";
      btn.style.height = "44px";
      btn.style.bottom = "10px";
      btn.style.right = "10px";
    } else {
      btn.style.width = "48px";
      btn.style.height = "48px";
      btn.style.bottom = "12px";
      btn.style.right = "12px";
    }
  }

  static updateButtonState(btn, state, message = "") {
  const states = {
    loading: {
      background: "#0f2a44",
      icon: `
<svg 
  width="20" 
  height="20" 
  viewBox="0 0 24 24" 
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  class="spin-animation"
>
  <circle cx="12" cy="12" r="9" stroke-opacity="0.25"/>
  <path d="M21 12a9 9 0 0 1-9 9"/>
</svg>
`
    },
    error: {
      background: "#c0392b",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`
    },
    normal: {
      background: "#0f2a44",
      icon: `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="20" 
  height="20" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  stroke-width="1.8"
  stroke-linecap="round" 
  stroke-linejoin="round"
>
  <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
  <path d="M20 2v4"/>
  <path d="M22 4h-4"/>
  <circle cx="4" cy="20" r="2"/>
</svg>
`
    }

  };

  const config = states[state] || states.normal;
  btn.style.background = config.background;
  btn.innerHTML = config.icon;

  if (message) {
    btn.title = message;
  }

  // Add spin animation for loading state
  if (state === 'loading') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `;
    if (!document.querySelector('style[data-ai-button-animation]')) {
      style.setAttribute('data-ai-button-animation', 'true');
      document.head.appendChild(style);
    }
  }
}

  static positionButton(btn, container) {
  if (container) {
    const containerStyle = globalThis.getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = "relative";
    }

    const composeContainer = this.findBestContainer(container);
    composeContainer.appendChild(btn);

    this.ensureButtonVisibility(btn, composeContainer);
  } else {
    document.body.appendChild(btn);
  }
}

  static findBestContainer(element) {
  const composeDialog = element.closest('[role="dialog"]') ||
    element.closest('.nH') ||
    element.closest('.Ar') ||
    element.closest('.aoI');

  if (composeDialog) {
    return composeDialog;
  }
  return element.parentElement || element;
  }

  static ensureButtonVisibility(btn, container) {
  const resizeObserver = new ResizeObserver(() => {
    this.adjustButtonPosition(btn, container);
  });

  resizeObserver.observe(container);
  btn._resizeObserver = resizeObserver;
  this.adjustButtonPosition(btn, container);
}

  static adjustButtonPosition(btn, container) {
  const containerRect = container.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  const rightEdge = Number.parseInt(btn.style.right || '12');
  const bottomEdge = Number.parseInt(btn.style.bottom || '12');

  if (containerRect.width < (btnRect.width + rightEdge)) {
    btn.style.right = Math.max(5, containerRect.width - btnRect.width - 5) + 'px';
  }

  if (containerRect.height < (btnRect.height + bottomEdge)) {
    btn.style.bottom = Math.max(5, containerRect.height - btnRect.height - 5) + 'px';
  }
}

  static cleanupButton(btn) {
  if (btn._resizeHandler) {
    window.removeEventListener('resize', btn._resizeHandler);
    delete btn._resizeHandler;
  }
  if (btn._resizeObserver) {
    btn._resizeObserver.disconnect();
    delete btn._resizeObserver;
  }

  if (btn.parentElement) {
    btn.remove();
  }
  }
}