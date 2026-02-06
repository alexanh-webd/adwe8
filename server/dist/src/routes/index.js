import { Router } from "express";
import { validationResult } from 'express-validator';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Topic } from '../models/Topic.js';
import { TextFile } from '../models/TextFile.js';
import { registerValidation } from '../validators/inputValidation.js';
import upload from "../middleware/multer-config.js";
import path from "path";
import fs from "fs/promises";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
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
            const token = jwt.sign(jwtPayload, process.env.SECRET, { expiresIn: "120m" });
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
router.post("/api/upload", validateToken, upload.single("image"), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const imgPath = req.file.path.replace("public", "");
        const textfile = new TextFile({
            filename: req.file.filename,
            path: imgPath,
            owner: req.user.id
        });
        await textfile.save();
        console.log("File uploaded and saved in the database");
        return res.status(201).json({ message: "File uploaded and saved in the database", owner: textfile.owner });
    }
    catch (error) {
        console.error(`Error while uploading file: ${error}`);
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/api/files", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const files = await TextFile.find({ owner: req.user.id });
        const sharedFiles = await TextFile.find({ editor: req.user.id });
        files.push(...sharedFiles);
        res.status(200).json(files);
    }
    catch (error) {
        console.error(`Error fetching files: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/file/:id/permission", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const editorId = req.body.editorId;
        const fileId = req.params.id;
        if (!editorId || !fileId || !mongoose.Types.ObjectId.isValid(editorId) || !mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid editor ID or file ID" });
        }
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        if (file.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can update permissions" });
        }
        if (file.editor.includes(editorId)) {
            return res.status(400).json({ message: "User already has edit permissions" });
        }
        if (!file.editor.includes(editorId)) {
            file.editor.push(editorId);
            await file.save();
            return res.status(200).json({ message: "Edit permissions granted successfully" });
        }
    }
    catch (error) {
        console.error(`Error updating file: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/api/file/:id/edit/start", validateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const file = await TextFile.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        const userId = req.user.id; // Comes from the validated token
        const canEdit = file.owner.toString() === userId ||
            file.editor.map(id => id.toString()).includes(userId);
        if (!canEdit) {
            return res.status(403).json({ message: "You do not have permission to edit this file" });
        }
        if (!file.editingSessions.fileLocked) {
            const savedAt = req.body.savedAt;
            file.editingSessions.userId = new mongoose.Types.ObjectId(userId);
            file.savedAt = savedAt;
            const fileContent = req.body.content;
            await fs.writeFile(path.join(process.cwd(), "public", file.path), fileContent);
            //file.editingSessions.fileLocked = true;
            await file.save();
            return res.status(200).json({ message: "Editing successfully", editingBy: req.user.username });
        }
        else {
            return res.status(409).json({ message: "File is currently being edited by another user" });
        }
    }
    catch (error) {
        console.error(`Error editing file: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.delete("/api/delete/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        if (file.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can delete the file" });
        }
        const fullPath = path.join(process.cwd(), "public", file.path);
        //const recycleBinPath = path.join(process.cwd(), "public", "recyclebin", file.filename);
        await fs.unlink(fullPath);
        //await fs.rename(fullPath, recycleBinPath);
        await TextFile.findByIdAndDelete(fileId);
        //await TextFile.findByIdAndUpdate(fileId, { path: path.join("recyclebin", file.filename) });
        return res.status(200).json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error(`Error deleting file: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/file/:id/rename", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        if (file.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner can rename the file" });
        }
        const newFilename = req.body.newFilename;
        const oldFullPath = path.join(process.cwd(), "public", file.path);
        const newFullPath = path.join(process.cwd(), "public", "textfiles", newFilename);
        await fs.rename(oldFullPath, newFullPath);
        file.filename = newFilename;
        file.path = path.join("textfiles", newFilename);
        await file.save();
        return res.status(200).json({ message: "File renamed successfully" });
    }
    catch (error) {
        console.error(`Error renaming file: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/api/content/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        const fileContent = await fs.readFile(path.join(process.cwd(), "public", file.path), "utf-8");
        return res.status(200).json({ content: fileContent });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/api/nonAuth/content/:id", async (req, res) => {
    try {
        const fileId = await req.params.id;
        const getFile = await TextFile.findById(fileId);
        if (!getFile) {
            return res.status(404).json({ message: "File not found" });
        }
        const fileContent = await fs.readFile(path.join(process.cwd(), "public", getFile.path), "utf-8");
        return res.status(200).json({ content: fileContent });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/lock/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        file.editingSessions.fileLocked = true;
        await file.save();
        return res.status(200).json({ lockStatus: file.editingSessions.fileLocked });
    }
    catch (error) {
        console.error(`Error fetching lock status: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/unlock/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }
        file.editingSessions.fileLocked = false;
        await file.save();
        return res.status(200).json({ lockStatus: file.editingSessions.fileLocked });
    }
    catch (error) {
        console.error(`Error unlocking file: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/read=true/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "No such file exists" });
        }
        file.readOnly = true;
        await file.save();
        return res.status(200).json({ message: "File readonly is true" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.put("/api/read=false/:id", validateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const fileId = req.params.id;
        const file = await TextFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "No such file in database" });
        }
        file.readOnly = false;
        await file.save();
        return res.status(200).json({ message: "File readonly is false" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error!" });
    }
});
router.get("/api/file/nonAuthenticate", async (req, res) => {
    try {
        const allFile = await TextFile.find({ readOnly: true });
        return res.status(200).json({ file: allFile });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/api/file/:id/downloadPDF", async (req, res) => {
    try {
        const file = await TextFile.findById(req.params.id);
        if (!file) {
            return res.status(400).json({ message: "No such file" });
        }
        const filePath = path.join(process.cwd(), "public", file.path);
        const fileContent = await fs.readFile(filePath, "utf-8");
        //create PDF
        const pdfDoc = new PDFDocument({ size: "A4", margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${file.filename.replace(/\s+/g, "_")}.pdf"`);
        pdfDoc.pipe(res);
        // Add the text content
        pdfDoc.font("Times-Roman").fontSize(12).text(fileContent, { lineGap: 4 });
        pdfDoc.end();
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.post("/api/file/:id/comment", validateToken, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const line = req.body.line;
        const comment = req.body.comment;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "No such user" });
        }
        const file = await TextFile.findById(req.params.id);
        if (!file)
            return res.status(400).json({ message: "No such file" });
        file.comments.push({
            line: line,
            author: new mongoose.Types.ObjectId(req.user.id),
            authorName: user.username,
            comment: comment,
            createdAt: new Date()
        });
        await file.save();
        return res.status(200).json({ message: "Comment added successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/api/file/:id/getComment", validateToken, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const file = await TextFile.findById(req.params.id);
        if (!file)
            return res.status(404).json({ message: "No such file" });
        return res.status(200).json({ comment: file.comments });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
export default router;
//# sourceMappingURL=index.js.map