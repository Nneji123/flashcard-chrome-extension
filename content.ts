chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createFlashcard") {
      const flashcardText = request.text;
      chrome.storage.local.get({ userId: null }, (result) => {
        if (result.userId) {
          fetch('http://localhost:3000/api/flashcards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: result.userId,
              question: flashcardText,
              answer: "",
              tags: [],
            }),
          })
          .then(response => response.json())
          .then(data => {
            console.log("Flashcard saved remotely", data);
          })
          .catch(error => {
            console.error("Error saving flashcard remotely", error);
          });
        } else {
          console.error("User not logged in");
        }
      });
    }
  });
  
  