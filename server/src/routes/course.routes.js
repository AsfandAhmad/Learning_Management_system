import express from "express";

const router = express.Router();

// TODO: add course-specific routes here
router.get("/", (req, res) => res.json({ message: "Courses route" }));

export default router;
