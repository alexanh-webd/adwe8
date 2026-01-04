import type {Request, Response, NextFunction} from "express";
import type {JwtPayload} from "jsonwebtoken"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface DecodedUserJwtPayload extends JwtPayload {
    id: string;
    username: string;
    isAdmin?: boolean;
}
export interface CustomRequest extends Request {
    user?: DecodedUserJwtPayload;
}

export const adminCheckedToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token: string | undefined = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({message: "Token not found"});
    }
    try {
        const verified: DecodedUserJwtPayload = jwt.verify(token, process.env.SECRET as string) as DecodedUserJwtPayload;
        if (!verified) {
            return res.status(403).json({message: "Access denied."});
        } else if (!verified.isAdmin) {
            return res.status(403).json({message: "Access denied."});
        } else if (verified.isAdmin && verified) {
            req.user = verified;
            next();
        }
        
    } catch(error: any) {
        res.status(400).json({message: "Access error"});
    }
}