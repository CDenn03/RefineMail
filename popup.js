document.addEventListener("DOMContentLoaded", () => {
  const presetEl = document.getElementById("preset");
  const instructionEl = document.getElementById("instruction");
  const saveBtn = document.getElementById("saveSettings");
  const statusMsg = document.getElementById("statusMsg");

  chrome.storage.sync.get(["preset", "instruction"], (res) => {
    if (res.preset) presetEl.value = res.preset;
    if (res.instruction) instructionEl.value = res.instruction;
  });

  saveBtn.addEventListener("click", () => {
    const preset = presetEl.value;
    const instruction = instructionEl.value;

    chrome.storage.sync.set({ preset, instruction }, () => {
      statusMsg.textContent = "Default settings saved!";
      setTimeout(() => {
        statusMsg.textContent = "";
      }, 2000);
    });
  });
});