"use client";

import { useGlobalWebSocket } from "@/ContextAPI/WebSocketContextProvider";
import { ReadyState } from "react-use-websocket";
import { Canvas } from "./Canvas";
import { Shapes } from "@/draw";

export type AccessMode = 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_EDIT';

export function RoomCanvas({ roomId, gotExistingShapes, accessMode, admin }: {roomId: string, gotExistingShapes: Shapes[], accessMode: AccessMode, admin: boolean}){
        const {sendMessage, lastMessage, readyState, connectionStatus} = useGlobalWebSocket();
        
        if(readyState === ReadyState.OPEN){
            return <Canvas roomId={roomId} sendMessage={sendMessage} lastMessage={lastMessage} gotExistingShapes={gotExistingShapes} accessMode={accessMode} admin={admin} />
        }
        else if(readyState === ReadyState.CONNECTING){
            return (
                <div className="h-screen w-screen flex justify-center items-center text-3xl font-sans">
                    Connecting to the server
                </div>
            )
        }
        else if(readyState === ReadyState.CLOSED){
            return (
                <div className="h-screen w-screen flex justify-center items-center text-3xl font-sans">
                    Connection has been closed
                </div>
            )
        }
        else if(readyState === ReadyState.CLOSING){
            return (
                <div className="h-screen w-screen flex justify-center items-center text-3xl font-sans">
                    Connection is closing!
                </div>
            )
        }
        else {
            return (
                <div className="h-screen w-screen flex justify-center items-center text-3xl font-sans">
                    Connection UNINSTANTIATED
                </div>
            )
        }
}