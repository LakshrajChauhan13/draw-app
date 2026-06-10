import { JWT_SECRET_KEY } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'

export function userMiddleware(req: Request, res: Response , next: NextFunction){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            message: "No token provided"
        })
    }
    const token = authHeader.split(' ')[1]
    if(!token){
        return res.status(401).json({
            message: "No token provided"
        })
    }

    try{
        const decodedInfo = jwt.verify(token, JWT_SECRET_KEY);
        if(typeof decodedInfo === 'string'){
            return res.json({
                message: "Token Invalid, can't be string "
            })
        }
        
        if(decodedInfo){
            req.id = (decodedInfo as JwtPayload).userId;
        }
        next()
    }catch(err){
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }

}