"use client";

import { useGlobalWebSocket } from "@/ContextAPI/WebSocketContextProvider";
import { ReadyState } from "react-use-websocket";
import { Canvas } from "./Canvas";
import { Shapes } from "@/draw";

export function RoomCanvas({ roomId, gotExistingShapes }: {roomId: number, gotExistingShapes: Shapes[]}){
        const {sendMessage, lastMessage, readyState, connectionStatus} = useGlobalWebSocket();
        
        if(readyState === ReadyState.OPEN){
            return <Canvas roomId={roomId} sendMessage={sendMessage} lastMessage={lastMessage} gotExistingShapes={gotExistingShapes} />
        }

        if(readyState === ReadyState.CONNECTING){
            return (
                <div className="h-screen w-screen flex justify-center items-center text-3xl font-sans">
                    Connecting to the server
                </div>
            )
        }
}