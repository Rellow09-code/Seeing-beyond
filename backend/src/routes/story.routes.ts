import { Router } from "express";
import { StoryModel } from "../database/model/Story";

const router = Router();

// Create new story
router.post("/", async (req, res) => {
  try {
    const { name, message, userId } = req.body;

    const story = new StoryModel({
      name,
      message,
      user: userId || null,
    });

    await story.save();
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: "Failed to save story" });
  }
});

// Get all stories
router.get("/", async (req, res) => {
  try {
    const stories = await StoryModel.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

export default router;
