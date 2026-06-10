import express from "express";
import bcrypt from "bcrypt";
import { client, Prisma } from "@repo/db/client";
import { safeSignUpSchema, safeSignInSchema, roomSlugSchema, flatten_Error } from "@repo/common/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";
import { userMiddleware } from "./middleware/user.middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.post('/signup', async (req, res) => {
    const parsedBody = safeSignUpSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.json({
            message: "Invalid format",
            errors: flatten_Error(parsedBody.error).fieldErrors
        })
    }
    const {username, email, password, photo } = parsedBody.data
    const hashedPassword = await bcrypt.hash(password, 5)

    try{
        const response = await client.user.create({
            data : {
                username: username,
                email: email,
                password: hashedPassword,
                photo: photo
            }
        })
    }catch(err){
        return res.status(409).json({
            message: "User already exists!!"
        })
    }
    
    return res.json({
        message: "User signed up successfully!"
    })
    
})

app.post('/signin', async (req, res) => {
    const parsedBody = safeSignInSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.json({
            message: "Invalid format",
            errors: flatten_Error(parsedBody.error).fieldErrors
        })
    }
    const {email, password } = parsedBody.data

    const userFound = await client.user.findFirst({
        where: {
            email: email
        }
    })

    if(!userFound){
        return res.status(404).json({
            message: "User doesn't exists!!"
        })
    }

    const passwordMatch = await bcrypt.compare(password, userFound.password)
    if(!passwordMatch){
        return res.status(401).json({
            message: "Invalid Credentials! Plz try again..."
        })
    }

    const token = await jwt.sign({
        userId: userFound.id
    }, JWT_SECRET_KEY )        

    
    return res.json({
        message: "User signed in successfully!",
        token: token
    })
    
})

app.post('/room', userMiddleware, async (req, res) => {
    const userId = req.id as string;
    const parsedBody = roomSlugSchema.safeParse(req.body)

    if(!parsedBody.success){
        console.log(parsedBody.error);
        return res.json({
            message: "Invalid format",
            error: flatten_Error(parsedBody.error).fieldErrors
        })
    }
    const { slug } = parsedBody.data;
    try{
        const response = await client.room.create({
            data: {
                slug: slug,
                adminId: userId
            }
        })
        
        return res.status(201).json({
            message: `room created `,
            roomName: slug,
            roomId: response.id
        })

    }catch(err){
        console.log("Room creation failed -->", err)
        if(err instanceof Prisma.PrismaClientKnownRequestError){
            if(err.code === 'P2002'){
                return res.status(409).json({
                    message: "Room with the slug already exists" 
                })
            }
        }
 
        if(err instanceof Prisma.PrismaClientInitializationError){
            return res.status(503).json({
                message: "Database unavailable, try again later !"
            })
        }
        
        return res.status(500).json({
            message: "Room creation failed due to internal server error. Try again later !"
        })
    }
})

app.get('/room/chats/:roomId', userMiddleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    try{
        const chats = await client.chat.findMany({
            where:{
                roomId: roomId
            }
    })
    return res.json({
        messages: chats
    })
    
    }catch(err){
        if(err instanceof Prisma.PrismaClientInitializationError){
            return res.status(503).json({
                message: "Database unavailable, try again later!"
            })
        }
        return res.status(500).json({
            message: "Failed to fetch chats, try again later!"
        })
    }
})

app.listen(3000, () => {
    console.log('server is running on the port 3000')
});