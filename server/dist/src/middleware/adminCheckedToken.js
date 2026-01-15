import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const adminCheckedToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }
    try {
        const verified = jwt.verify(token, process.env.SECRET);
        if (!verified) {
            return res.status(403).json({ message: "Access denied." });
        }
        else if (!verified.isAdmin) {
            return res.status(403).json({ message: "Access denied." });
        }
        else if (verified.isAdmin && verified) {
            req.user = verified;
            next();
        }
    }
    catch (error) {
        res.status(400).json({ message: "Access error" });
    }
};
//# sourceMappingURL=adminCheckedToken.js.map