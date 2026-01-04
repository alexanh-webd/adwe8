import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
interface DecodedUserJwtPayload extends JwtPayload {
    id: string;
    username: string;
    isAdmin?: boolean;
}
export interface CustomRequest extends Request {
    user?: DecodedUserJwtPayload;
}
export declare const validateToken: (req: CustomRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validateToken.d.ts.map