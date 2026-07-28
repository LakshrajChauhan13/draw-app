import express from "express";
import bcrypt from "bcrypt";
import { client, Prisma } from "@repo/db/client";
import { safeSignUpSchema, safeSignInSchema, roomSlugSchema, flatten_Error, updateAccessModeSchema } from "@repo/common/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";
import { userMiddleware } from "./middleware/user.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import { OptionalAuthRequest, optionalUserMiddleware } from "./middleware/optional.user.middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3002",
    credentials: true
}))

app.post('/signup', async (req, res) => {
    const parsedBody = safeSignUpSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.status(400).json({
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
        return res.status(400).json({
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

    const token = jwt.sign({
        userId: userFound.id
    },  JWT_SECRET_KEY, 
    {
        expiresIn: "7d"
    })        

    res.cookie('accessToken', token)
    
    return res.json({
        message: "User signed in successfully!",
        token: token
    })
    
})

app.post('/room', userMiddleware, async (req, res) => {                     // create a room
    const userId = req.id as string;
    const parsedBody = roomSlugSchema.safeParse(req.body)

    if(!parsedBody.success){
        console.log(parsedBody.error);
        return res.status(400).json({
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
            message: `Room created!`,
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

app.delete('/room/:id', userMiddleware, async (req, res) => {               // to delete a room
    const roomId = req.params.id as string;
    console.log(roomId, "inside the /room/:id ");
    try {
        const response = await client.room.delete({
            where: {
                id: roomId
        }
    })
    return res.json({
        message: 'Room has been deleted !'
    })

    }catch(err){
        console.error(err)
        if(err instanceof Prisma.PrismaClientInitializationError){
            return res.status(503).json({
                message: "Database unavailable, try again later!"
            })
        }
        return res.status(500).json({
            message: "Deletion failed, try again later!"
        })
    }
})

app.get('/room/chats/:roomId', optionalUserMiddleware, async (req: OptionalAuthRequest, res) => {        // get all the chats/shapes of the room
    const roomId = req.params.roomId as string;
    const userId = req.userId;

    const room = await client.room.findUnique({
        where: {
            id: roomId
        }, 
        select: {
            accessMode: true,
            adminId: true
        }
    })

    if(!room){
        return res.status(401).json({
            message: "Room not found"
        })
    }
    
    const isAdmin = userId === room?.adminId;
    const isPrivate = room?.accessMode === 'PRIVATE';
    
    if(!isAdmin && isPrivate){
        return res.status(403).json({
            message: "This canvas is private. You must be the owner to view it."    
        })
    }
``    
    try{
        const chats = await client.chat.findMany({
            where:{
                roomId: roomId
            }
    })
    return res.json({
        messages: chats,
        accessMode: room.accessMode,
        admin: isAdmin
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

app.get('/all/rooms', userMiddleware, async (req, res) => {                 // get all rooms of the user
    const userId = req.id;

    try {
        const rooms = await client.room.findMany({
            where: {
                adminId: userId
            },
        select: {
            id: true,
            slug: true,
            createdAt: true,
            accessMode: true,
            _count: {
                select : {
                    members: true
                }
            }
        }
        })

        const user = await client.user.findFirst({
            where: {
                id: userId
            },
            select: {
                username: true,
                email: true  
            }
        })
    
        return res.json({
            rooms: rooms,
            user: user
        })
    }catch (err) {
        console.error("Failed to fetch rooms:", err);
        
        if (err instanceof Prisma.PrismaClientInitializationError) {
            return res.status(503).json({
                message: "Database unavailable, try again later!"
            });
        }
        
        return res.status(500).json({
            message: "Failed to fetch your rooms due to an internal server error."
        });
    }
    
})

app.patch('/room/:roomId/access', userMiddleware, async (req, res) => {     
    const cardCanvasId = req.params.roomId as string;
    const userId = req.id;
    
    const parsedBody = updateAccessModeSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.status(400).json({
            message: "Invalid format",
            errors: flatten_Error(parsedBody.error).fieldErrors
        })
    }

    const {accessMode} = parsedBody.data;

    const room = await client.room.findUnique({
        where: {
            id: cardCanvasId
        }, 
        select: {
            adminId: true
        }
    })

    if(!room){
        return res.json({
            message: "Room not found"
        })
    }

    const isAdmin = userId === room.adminId
    
    if(isAdmin){
        try {
            const response = await client.room.update({
                where: {
                    id: cardCanvasId
                },
                data: {
                    accessMode: accessMode
                }
            })
            
            res.status(202).json({
                message: "Access mode updated",
                accessMode: accessMode
            })
        }catch(err){
            console.log(" Error while updating the access mode for the room", err)
            if( err instanceof Prisma.PrismaClientInitializationError){
                return res.status(503).json({
                    message: "Database unavailable, try again later!"
                })
            }

            return res.status(500).json({
                message: "Failed to update the room's access mode due to an internal server error"
            })
        }
    }else{
        return res.status(403).json({
            message: "You must be the owner to update the access mode for this room."
        })
    }
})

app.get('/check/:roomId', async (req, res) => {                             // roomId exists or not 
    const roomId = req.params.roomId;
    try{
        const response = await client.room.findFirst({
            where: {
                id: roomId
            },
            select: {
                id: true,
                slug: true
           }
        });

        if(response){
            return res.status(200).json({
                exists: true,
                message: 'Room exists !',
                room: response
            })
        }

        return res.status(404).json({
            exists: false,
            message: "Room doesn't exist, check your room ID.",
            room: roomId
        })
    }catch(err){
        console.error('Error checking room existence :-->', err)

        if( err instanceof Prisma.PrismaClientInitializationError){
            return res.status(503).json({
                message: 'Database unavailable, try again later...'
            })    
        }

        return res.status(500).json({
            message: 'Failed to verify room due to an internal server error.'
        })
    }
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Async Rejection at:', promise, 'reason:', reason);
});


async function startServer() {
    // const PORT = 3000;
    let connected = false;
    let retries = 5;

    console.log("Initiating Express server pre-flight handshake context...");

    while (!connected && retries > 0) {
        try {
            // $connect() wakes up the Postgres server without making a database query table search
            await client.$connect();
            connected = true;
            console.log("🔌 Database link secured successfully! Neon compute engine is awake.");
        } catch (err) {
            retries--;
            console.warn(`⏳ Neon DB is waking up. Retries remaining: ${retries}. Waiting 2.5 seconds...`);
            // Wait 2.5 seconds before attempting another database handshake
            await new Promise((resolve) => setTimeout(resolve, 2500));
        }
    }

    if (!connected) {
        console.error("❌ Critical Failure: Could not establish a connection to Neon DB. Terminating process.");
        process.exit(1);
    }

    // Bind Express to port 3000 only after database confirmation is complete
    app.listen(3000, () => {
        console.log(`🚀 HTTP Server is fully operational on port 3000`);
    });
}

startServer()