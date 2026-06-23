import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";
import { client } from '@repo/db/client'

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

async function startWebSocketServer(){
    let connected = false;
    let retries = 5;

    while(!connected && retries > 0){
        try{
            await client.$connect();
            connected = true;
            console.log('🔌Database link secured successfully! Neon is up.');
        }catch(error){
            retries--;
            console.error(`⏳ Neon DB is cold-booting. Retries remaining: ${retries}. Re-trying handshake...`);
            await new Promise((resolve) => setTimeout(resolve, 2500))
        }
    }

    if(!connected){
        console.error("❌ Critical Failure: WebSocket cluster could not bridge to Neon DB.");
        process.exit(1);
    }
     
    console.log("🚀WebSocket engine running smoothly on port 8080");

    const wss = new WebSocketServer({port: 8080})

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

        if(data.type === 'draw-preview'){
            if(currentRoomId && rooms.has(currentRoomId)) {
                const previewShape = data.payload.previewShape;
                const room = rooms.get(currentRoomId);

                room?.users.forEach((clientSocket) => {
                    if (clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN) {
                        clientSocket.send(JSON.stringify({
                            type: "live-preview-update",
                            payload: { previewShape: previewShape }
                        }));
                    }
                });
            }
        }

        if(data.type === 'clear-preview'){
            if(currentRoomId && rooms.has(currentRoomId)) {
                const room = rooms.get(currentRoomId);

                room?.users.forEach((clientSocket) => {
                    if(clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN) {
                        clientSocket.send(JSON.stringify({
                            type: "clear-live-preview"
                        }));
                    }
                });
            }
        }
    })

    socket.on('close', async (message) => {
        if(currentRoomId && rooms.has(currentRoomId)) {
            const room = rooms.get(currentRoomId)!;
            room.users.delete(socket);
            room.userId.delete(userId);
            console.log(`${userId} left the room`)
            
            if(room.users.size === 0){
                rooms.delete(currentRoomId);
                console.log(`🧹 Vacant Room ${currentRoomId} unmounted cleanly from in memory tracking.`);
            }
        }       
    })
})
}

async function handleJoin(socket: WebSocket, roomId: number, userId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const isAlreadyInRoom = room.users.has(socket);

    if (!isAlreadyInRoom) {
    if (room.users.size < 10) {
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
 
startWebSocketServer()