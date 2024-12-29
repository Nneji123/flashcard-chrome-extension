import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/flashcards', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions);

const UserSchema = new mongoose.Schema({
  userId: String,
  email: String,
});

const FlashcardSchema = new mongoose.Schema({
  id: String,
  userId: String,
  question: String,
  answer: String,
  tags: [String],
});

const User = mongoose.model('User', UserSchema);
const Flashcard = mongoose.model('Flashcard', FlashcardSchema);

app.post('/api/users', async (req, res) => {
  const { userId, email } = req.body;
  const user = new User({ userId, email });
  await user.save();
  res.json(user);
});

app.post('/api/flashcards', async (req, res) => {
  const { userId, question, answer, tags } = req.body;
  const flashcard = new Flashcard({
    id: uuidv4(),
    userId,
    question,
    answer,
    tags,
  });
  await flashcard.save();
  res.json(flashcard);
});

app.get('/api/flashcards', async (req, res) => {
  const { userId } = req.query;
  const flashcards = await Flashcard.find({ userId });
  res.json(flashcards);
});

app.put('/api/flashcards', async (req, res) => {
  const { id, userId, question, answer, tags } = req.body;
  const flashcard = await Flashcard.findOneAndUpdate(
    { id, userId },
    { question, answer, tags },
    { new: true }
  );
  res.json(flashcard);
});

app.delete('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;
  await Flashcard.deleteOne({ id });
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

