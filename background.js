chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "createFlashcard",
      title: "Create Flashcard",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "createFlashcard" && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "createFlashcard", text: info.selectionText });
    }
  });
  
  