import { getExistingShapes, isRoomExistsApi } from '@/api/room.api';
import { PrivateCanvasPage } from '@/app/component/PrivateCanvasPage';
import { RoomCanvas } from '@/app/component/RoomCanvas';
import { Button } from '@/components/ui/button';
import WebSocketContextProvider from '@/ContextAPI/WebSocketContextProvider';
import axios from 'axios';
import { LockIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function CanvasPage ({params}: {
    params: Promise<{ roomId: string }> | { roomId: string };
}){
    const roomId = (await params).roomId;
    console.log(roomId);
    
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString()

    try{
        await isRoomExistsApi(roomId, cookieHeader)
        const { shapes, accessMode, admin } = await getExistingShapes(roomId, cookieHeader)
        
        return (
            <WebSocketContextProvider>
                <RoomCanvas roomId={roomId} gotExistingShapes={shapes} accessMode={accessMode} admin={admin} />
            </WebSocketContextProvider>
        )
    }catch(error: unknown){
        if(axios.isAxiosError(error)){
            if(error.response?.status === 404){
                notFound()
            }
            if(error.response?.status === 403) {
                const errorMessage = error.response.data.message || "You don't have permission to view this canvas.";
                
                return (
                    <PrivateCanvasPage errorMessage={errorMessage} />
                );
            }
        }
        console.log("Unhandled error in the /canvas/[roomId]/page.tsx server fetch")
        throw error
    }
}

export default CanvasPage