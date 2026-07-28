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
const rooms = new Map<string, RoomData>();

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

    const validUserId = token ? authenticateUser(token) : null;
    const userId = validUserId || `guest_${Math.random().toString(36).substring(2, 9)}`
    const isGuest = !validUserId ;
    
    // if(!userId){
    //     guestId = `guest_${Math.random().toString(36).substring(2, 9)}`
    //     // socket.close();
    //     // return;
    // }

    let cachedUsername: string | undefined;
    let currentRoomId: string | undefined ; 
    let roomAdminId: string;
    
    socket.on('message', async (message) => {
        const data = JSON.parse(message.toString());

        if(data.type === 'join'){
            const roomId = data.payload.roomId ;
            const roomIdExistsInDB = await client.room.findUnique({
                where: {
                    id: roomId
                }
            })
            if(!roomIdExistsInDB){
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Room not found!"
                }))
                return
            }          

            roomAdminId = roomIdExistsInDB.adminId;
            
            if(!rooms.has(roomId)){
                rooms.set(roomId, { users: new Set(), userId: new Set(), clock: undefined})
            }

            if(!cachedUsername){
                if(!isGuest){
                    const userData = await client.user.findFirst({
                        where: {
                            id: userId
                        },
                        select: {
                            username: true,
                            id: true
                        }
                    })
                    cachedUsername = userData?.username || 'Authenticated User'
                }else{
                 cachedUsername = `Guest (${userId.slice(-4)})`;   
                }
            }

            await handleJoin(socket, roomId, userId, cachedUsername);
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

        if(data.type === 'access-mode-update'){
            if(currentRoomId && rooms.has(currentRoomId)){
                const newMode = data.payload.accessMode;
                const room = rooms.get(currentRoomId);
                console.log(newMode)
                room?.users.forEach((clienSocket) => {
                    if(clienSocket !== socket && clienSocket.readyState === WebSocket.OPEN){
                        clienSocket.send(JSON.stringify({
                            type: "access-mode-update",
                            payload: {
                                accessMode: newMode
                            }
                        }))
                    }
                })
            }
        }
        
    })

    socket.on('close', async (message) => {
        if(currentRoomId && rooms.has(currentRoomId)) {
            const room = rooms.get(currentRoomId)!;
            room.users.delete(socket);
            room.userId.delete(userId);
            console.log(`${userId} left the room`)
            room.users.forEach(clientSocket => {
                if( clientSocket.readyState === WebSocket.OPEN && clientSocket !== socket){
                    clientSocket.send(JSON.stringify({
                        type: "system",
                        message: `${cachedUsername} has left the room`
                    }))
                }
            })
            
            if(room.users.size === 0){
                rooms.delete(currentRoomId);
                console.log(`🧹 Vacant Room ${currentRoomId} unmounted cleanly from in memory tracking.`);
            }
        }       
    })
})
}

async function handleJoin(socket: WebSocket, roomId: string, userId: string, username: string) {
    const room = rooms.get(roomId);
    if (!room) return;
    // console.log(username, "from handleJoin")

    const isAlreadyInRoom = room.users.has(socket);

    if (!isAlreadyInRoom) {
    if (room.users.size < 10) {
        room.users.add(socket);
        room.userId.add(userId);
    } else {
        socket.send(JSON.stringify({
            type: 'error',
            payload: { roomId },
            message: 'Room is full (Max 10 allowed)'
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
        message: `${username} has joined!`,
        userId: userId,
        id: Math.random().toString(36).substring(2, 9),
        roomUserCount: room.users.size
    };

    room.users.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== socket) {
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