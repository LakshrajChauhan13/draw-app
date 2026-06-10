import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";
import { client } from '@repo/db/client'

const wss = new WebSocketServer({port: 8080})

function authenticateUser(token: string): string | null {
    try{
        const decodedInfo = jwt.verify(token as string, JWT_SECRET_KEY); 
        console.log(decodedInfo);
        
        if(!decodedInfo || !(decodedInfo as JwtPayload).userId){
            return null;
        }
        return (decodedInfo as JwtPayload).userId;
    }catch(err){
        console.log(err);
        return null;
    }
}

interface RoomData {
    users: Set <WebSocket>;          // using set instead of an [], coz SET always carries the unique values. as all websocket/user are unique.
    userId: Set <string>;
    clock: NodeJS.Timeout | undefined
}

const rooms = new Map<number, RoomData>();

wss.on('connection', async (socket: WebSocket, request) => {
    const url = request.url;
    
    const queryParams = new URLSearchParams(url?.split('?')[1]);
    const token = queryParams.get('token');
    if(!token){
        socket.close();
        return ;
    }
    const userId = authenticateUser(token);
    if(!userId){
        socket.close();
        return;
    }
    let currentRoomId: number | undefined ; 
    
    socket.on('message', async (message) => {
        // socket.send('heya authenticated person welcome');
        const data = JSON.parse(message.toString());

        if(data.type === 'join'){
            const roomId = Number(data.payload.roomId);
            const roomIdExistsInDB = await client.room.findUnique({
                where: {
                    id: roomId
                }
            })
            if(!roomIdExistsInDB){
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Room not found!! "
                }))
                return
            }          
            
            if(!rooms.has(roomId)){
                rooms.set(roomId, { users: new Set(), userId: new Set(), clock: undefined})
            }

            await handleJoin(socket, roomId, userId);
            currentRoomId = roomId;
        }

        if(data.type === 'draw'){
            if(currentRoomId && rooms.has(currentRoomId)){

                const drawing = data.payload.shape;
                const room = rooms.get(currentRoomId);
                console.log(drawing);

                room?.users.forEach((clientSocket) => {
                    if(clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN){
                        clientSocket.send(JSON.stringify({
                            type: "received",
                            payload: {
                                drawing: drawing
                            }
                        }))
                    }
                })
                
                const res = await client.chat.create({
                    data: {
                        message: JSON.stringify(drawing),
                        roomId: currentRoomId,
                        userId: userId,
                    }
                })
            }

        }
    })

})

async function handleJoin(socket: WebSocket, roomId: number, userId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const isAlreadyInRoom = room.users.has(socket);
    
    if (!isAlreadyInRoom) {
        if (room.users.size < 2) {
            room.users.add(socket);
            room.userId.add(userId);
        } else {
            socket.send(JSON.stringify({
                type: 'error',
                payload: { roomId },
                message: 'Room is full (Max 2 allowed)'
            }));
            return;
        }
    }
    
    socket.send(JSON.stringify({
        type: "joined",
        payload: { roomId },
        roomUserCount: room.users.size
    }));
    
    if (!isAlreadyInRoom) {
        const systemObj = {
            type: 'system',
            message: `${userId} has joined!`,
            userId: userId,
            id: Math.random().toString(36).substring(2, 9),
            roomUserCount: room.users.size
        };
        
        room.users.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(systemObj));
            }
        });
    }

    if (room.clock) {
        clearTimeout(room.clock);
        room.clock = undefined;
    }
    // Notice: Historical database fetch is gone from here!
}