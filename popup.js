document.addEventListener("DOMContentLoaded", () => {
  const presetEl = document.getElementById("preset");
  const instructionEl = document.getElementById("instruction");
  const saveBtn = document.getElementById("improve");

  // Load saved settings
  chrome.storage.sync.get(["preset", "instruction"], (res) => {
    if (res.preset) presetEl.value = res.preset;
    if (res.instruction) instructionEl.value = res.instruction;
  });

  // Save on click
  saveBtn.addEventListener("click", () => {
    let preset = presetEl.value;
    let instruction = instructionEl.value;

    chrome.storage.sync.set({ preset, instruction }, () => {
      alert("Settings saved!");
    });
  });
});
