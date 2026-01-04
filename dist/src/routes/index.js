import { Router } from "express";
import { validationResult } from 'express-validator';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Topic } from '../models/Topic.js';
import { registerValidation, loginValidation } from '../validators/inputValidation.js';
import { validateToken } from '../middleware/validateToken.js';
import { adminCheckedToken } from '../middleware/adminCheckedToken.js';
const router = Router();
router.post("/api/user/register", registerValidation, async (req, res) => {
    // checking errors
    const errors = validationResult(req);
    // if errors exist, return bad request
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    // try catch --> create new user
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(403).json({ email: "Email already in use." });
        }
        else {
            // bycrypt password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            const newUser = new User({
                email: req.body.email,
                password: hash,
                username: req.body.username,
                isAdmin: req.body.isAdmin || false
            });
            await newUser.save();
            return res.json(newUser);
            //return res.status(200).json("ok");
        }
    }
    catch (error) {
        console.error("Error message: " + error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
router.post("/api/user/login", body('email').escape(), body('password'), async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const jwtPayload = {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            };
            const token = jwt.sign(jwtPayload, process.env.SECRET, { expiresIn: "2m" });
            return res.status(200).json({ token: token });
        }
        else {
            return res.status(401).json({ message: "login failed" });
        }
    }
    catch (error) {
        console.error("message: " + error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
router.get("/api/topics", async (req, res) => {
    try {
        const topics = await Topic.find({});
        res.status(200).json(topics);
    }
    catch (error) {
        console.error("message: " + error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
router.post("/api/topic", validateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const newTopic = new Topic({
            title: req.body.title,
            content: req.body.content,
            username: req.user.username,
            createdAt: Date.now()
        });
        newTopic.save();
        return res.status(200).json(newTopic);
    }
    catch (error) {
        console.error("messgage: " + error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
router.delete("/api/topic/:id", adminCheckedToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized admin access" });
    }
    else {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: "Topic ID is required" });
            }
            const topicId = req.params.id;
            await Topic.findByIdAndDelete(topicId);
            return res.status(200).json({ message: "Topic deleted successfully." });
        }
        catch (error) {
            return res.status(500).json({ message: "Internal Server error" });
        }
    }
});
export default router;
//# sourceMappingURL=index.js.map