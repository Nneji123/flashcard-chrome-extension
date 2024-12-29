import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { v4 as uuidv4 } from 'uuid';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get({ userId: null }, (result) => {
      if (result.userId) {
        setUserId(result.userId);
        fetchFlashcards(result.userId);
      }
    });
  }, []);

  const fetchFlashcards = (userId: string) => {
    fetch(`http://localhost:3000/api/flashcards?userId=${userId}`)
      .then(response => response.json())
      .then(data => setFlashcards(data))
      .catch(error => console.error("Error fetching flashcards", error));
  };

  const handleLogin = () => {
    const newUserId = uuidv4();
    chrome.storage.local.set({ userId: newUserId }, () => {
      setUserId(newUserId);
      fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: newUserId, email }),
      })
        .then(response => response.json())
        .then(data => {
          console.log("User registered", data);
          fetchFlashcards(newUserId);
        })
        .catch(error => console.error("Error registering user", error));
    });
  };

  const handleSaveFlashcard = (flashcard: Flashcard) => {
    fetch('http://localhost:3000/api/flashcards', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...flashcard, userId }),
    })
      .then(response => response.json())
      .then(data => {
        setFlashcards(flashcards.map(fc => fc.id === data.id ? data : fc));
      })
      .catch(error => console.error("Error saving flashcard", error));
  };

  const handleDeleteFlashcard = (id: string) => {
    fetch(`http://localhost:3000/api/flashcards/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setFlashcards(flashcards.filter(fc => fc.id !== id));
      })
      .catch(error => console.error("Error deleting flashcard", error));
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  if (!userId) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email to access your flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleLogin}>Login</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-[400px] p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Enhanced Flashcard Generator</h1>
      <Tabs defaultValue="flashcards">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        <TabsContent value="flashcards">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="mb-4">
              <CardHeader>
                <CardTitle>{flashcard.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter answer"
                  value={flashcard.answer}
                  onChange={(e) => handleSaveFlashcard({ ...flashcard, answer: e.target.value })}
                />
                <Input
                  className="mt-2"
                  placeholder="Add tags (comma-separated)"
                  value={flashcard.tags.join(', ')}
                  onChange={(e) => handleSaveFlashcard({ ...flashcard, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                />
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={() => handleDeleteFlashcard(flashcard.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Flashcards</CardTitle>
              <CardDescription>Download your flashcards as a JSON file</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleExport}>Export Flashcards</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;

