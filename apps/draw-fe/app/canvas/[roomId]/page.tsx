import { getExistingShapes } from '@/api/room.api';
import { RoomCanvas } from '@/app/component/RoomCanvas';
import WebSocketContextProvider from '@/ContextAPI/WebSocketContextProvider';
import useWebSocket from 'react-use-websocket';

async function CanvasPage ({params}: {
    params: { roomId: number }
}){
    const roomId = (await params).roomId;
    console.log(roomId);
    const gotExistingShapes = await getExistingShapes(roomId)
    
    return (
        <WebSocketContextProvider>
            <RoomCanvas roomId={roomId} gotExistingShapes={gotExistingShapes} />
        </WebSocketContextProvider>
    )
}

export default CanvasPage