import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET_KEY } from "@repo/backend-common/config";

export interface OptionalAuthRequest extends Request {
    userId?: string | null;
}

export function optionalUserMiddleware(req: OptionalAuthRequest, res: Response , next: NextFunction){
    const token = req.cookies?.accessToken;
    if(!token){
        req.userId = null;
        return next();
    }

    try{
        const decodedInfo = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload ;
        if(typeof decodedInfo === 'string'){
            return res.json({
                message: "Token Invalid, can't be string "
            })
        }
        
        if(decodedInfo){
            req.userId = (decodedInfo as JwtPayload).userId;
        }
    }catch(err){
        req.userId = null;
    }
    
    next();
}