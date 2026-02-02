document.addEventListener("DOMContentLoaded", () => {
  const presetEl = document.getElementById("preset");
  const instructionEl = document.getElementById("instruction");
  const saveBtn = document.getElementById("saveSettings");
  const statusMsg = document.getElementById("statusMsg");
  
  const currentEmailSection = document.getElementById("currentEmailSection");
  const noEmailSection = document.getElementById("noEmailSection");
  const currentSubject = document.getElementById("currentSubject");
  const currentBody = document.getElementById("currentBody");
  const improveNowBtn = document.getElementById("improveNow");
  const refreshEmailBtn = document.getElementById("refreshEmail");
  const detectEmailBtn = document.getElementById("detectEmail");


  if (chrome.storage?.sync) {
    chrome.storage.sync.get(["preset", "instruction"], (res) => {
      if (res.preset) presetEl.value = res.preset;
      if (res.instruction) instructionEl.value = res.instruction;
    });
  }


  saveBtn.addEventListener("click", () => {
    const preset = presetEl.value;
    const instruction = instructionEl.value;

    if (chrome.storage?.sync) {
      chrome.storage.sync.set({ preset, instruction }, () => {
        statusMsg.textContent = "Default settings saved!";
        setTimeout(() => {
          statusMsg.textContent = "";
        }, 2000);
      });
    } else {
      statusMsg.textContent = "Storage not available";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 2000);
    }
  });


  checkForActiveEmail();

  detectEmailBtn.addEventListener("click", checkForActiveEmail);
  refreshEmailBtn.addEventListener("click", checkForActiveEmail);
  
  improveNowBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "triggerImprove" });
      window.close(); 
    });
  });

  function checkForActiveEmail() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      

      chrome.tabs.sendMessage(tabId, { action: "getEmailContent" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Could not connect to content script:", chrome.runtime.lastError.message);
          showNoEmailState();
          return;
        }
        
        if (response?.hasEmail) {
          showEmailContent(response.subject, response.body, response.wordCount);
        } else {
          showNoEmailState();
        }
      });
    });
  }

  function showEmailContent(subject, body, wordCount) {
    currentSubject.value = subject || "(No subject)";

    const preview = body.length > 150 ? body.substring(0, 150) + "..." : body;
    currentBody.value = preview;
    
    improveNowBtn.textContent = `Improve Now (${wordCount || 0} words)`;
    
    currentEmailSection.style.display = "block";
    noEmailSection.style.display = "none";
  }

  function showNoEmailState() {
    currentEmailSection.style.display = "none";
    noEmailSection.style.display = "block";
  }
});