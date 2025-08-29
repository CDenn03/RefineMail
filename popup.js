document.getElementById("execute").addEventListener("click", () => {
  let preset = document.getElementById("preset").value;
  let instruction = document.getElementById("instruction").value;

  chrome.storage.sync.set({ preset, instruction }, () => {
    alert("Settings saved!");
  });
});
