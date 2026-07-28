"use client";

import { renderCanvas, draw, Shapes } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { SendMessage } from "react-use-websocket";
import { CircleIcon, LineIcon, RectIcon, TriangleIcon } from "@/icons/icons";
import ToolButton from "./ShapesButton";
import { toast } from "sonner";
import { AccessMode } from "./RoomCanvas";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToggleModeAccess } from "../hooks/useToggleAccessModeMutation";
import { PrivateCanvasPage } from "./PrivateCanvasPage";

export type ShapeType = "rect" | "line" | "circle" | "triangle";

export function Canvas({ roomId, sendMessage, lastMessage, gotExistingShapes, accessMode, admin }: {
    roomId: string;
    sendMessage: SendMessage;
    lastMessage: MessageEvent<any> | null;
    gotExistingShapes: Shapes[];
    accessMode: AccessMode,
    admin: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const collaboratorPreviewRef = useRef<Shapes | null>(null)
    const [currentTool, setCurrentTool] = useState<ShapeType>('rect')                         
    const currentToolRef= useRef<ShapeType>('rect')                                           
    const { toggleAccessModeMutation } = useToggleModeAccess();
    const [ localAccessMode, setLocalAccessMode] = useState<AccessMode>(accessMode)
    
    const isReadOnly = !admin && localAccessMode === 'PUBLIC_VIEW'
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        sendMessage(JSON.stringify({
            type: "join",
            payload: {
                roomId: roomId
            }
        }))
        const initDraw = draw(canvas, sendMessage, gotExistingShapes, currentToolRef, isReadOnly);
        return initDraw;    //clean up function
    }, [isReadOnly, roomId, sendMessage,]);

    const getStatusBadge = () => {
        if (admin) {
            if (localAccessMode === 'PRIVATE') return { text: "Private (Only You)", style: "bg-red-500/20 text-red-300 border-red-500/50" };
            if (localAccessMode === 'PUBLIC_VIEW') return { text: "Public (Read-Only for Guests)", style: "bg-blue-500/20 text-blue-300 border-blue-500/50" };
            if (localAccessMode === 'PUBLIC_EDIT') return { text: "Public (Collaborative)", style: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" };
        } else {
            if (localAccessMode === 'PUBLIC_VIEW') return { text: "View Only Mode", style: "bg-amber-500/20 text-amber-300 border-amber-500/50" };
            if (localAccessMode === 'PUBLIC_EDIT') return { text: "Collaborative Mode", style: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" };
        }
        return { text: "", style: "" };
    };

    const statusBadge = getStatusBadge();
    
    useEffect(() => {
        if(!lastMessage) return;
        const data = JSON.parse(lastMessage.data);
        try{
            if(data.type === 'access-mode-update' && data.payload.accessMode){
                const newMode = data.payload.accessMode;
                setLocalAccessMode(newMode)
                console.log(newMode)
            }
            if(!canvasRef.current) return;
            const ctx = canvasRef.current?.getContext("2d")!
            
            if(data.type === 'received' && data.payload.drawing){
                gotExistingShapes.push(data.payload.drawing);
                renderCanvas(ctx, canvasRef.current, gotExistingShapes, collaboratorPreviewRef.current);
            }

            if(data.type === 'live-preview-update' && data.payload.previewShape){
                collaboratorPreviewRef.current = data.payload.previewShape;
                renderCanvas(ctx, canvasRef.current, gotExistingShapes, collaboratorPreviewRef.current);
            }

            if(data.type === 'clear-live-preview'){
                collaboratorPreviewRef.current = null;
                renderCanvas(ctx, canvasRef.current, gotExistingShapes, collaboratorPreviewRef.current);
            }

            if(data.type === 'system'){
                // collaboratorPreviewRef.current = null;
                const message = data.message;
                toast.message(message);
                renderCanvas(ctx, canvasRef.current, gotExistingShapes, collaboratorPreviewRef.current);
            }

        }catch(error){
            console.error("Payload synchronization error exception:", error);
        }

    },[lastMessage, gotExistingShapes])

    const handleToolChange = (tool: ShapeType) => {
        currentToolRef.current = tool;
        setCurrentTool(tool)
    }

    if(!admin && localAccessMode === 'PRIVATE'){
        return <PrivateCanvasPage errorMessage={"This canvas is private. You must be the owner to view it."} />
    }
    
  return (
    <>
      <div className="relative">
        <canvas 
            ref={canvasRef} 
            width={window.innerWidth} 
            height={window.innerHeight} 
            className={`absolute ${isReadOnly ? 'cursor-default' : 'cursor-crosshair'}`}
        />

        <div className="absolute top-4 right-4 z-50">
            {admin ? (
                /* Admin View: Clickable Dropdown Badge */
                <Select 
                    value={localAccessMode} 
                    onValueChange={(value) => {
                        if(value){
                            const newMode = value as AccessMode;
                            toggleAccessModeMutation.mutate({roomId: roomId, accessMode: newMode}, {
                            onSuccess: () => {
                                setLocalAccessMode(newMode)

                                sendMessage(JSON.stringify({
                                    type: "access-mode-update",
                                    payload: { accessMode: newMode }
                                }))
                                console.log(newMode)
                            }
                        }
                    );}
                    }}
                    disabled={toggleAccessModeMutation.isPending} 
                >
                    <SelectTrigger 
                        className={`h-8 px-3 text-xs font-mono rounded-full border shadow-md flex items-center gap-2 backdrop-blur-sm focus:ring-0 focus:ring-offset-0 border-dashed ${statusBadge.style}`}
                    >
                        {/* Pulsing Status  */}
                        <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                        </span>
                        
                        {toggleAccessModeMutation.isPending ? "Updating..." : <SelectValue />}
                    </SelectTrigger>            
                    
                    <SelectContent align="end">
                        <SelectGroup>
                            <SelectLabel className="text-xs">Private Mode</SelectLabel>
                            <SelectItem value="PRIVATE" className="text-xs cursor-pointer">Private (Only You)</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                            <SelectLabel className="text-xs">Public Access</SelectLabel>
                            <SelectItem value="PUBLIC_VIEW" className="text-xs cursor-pointer">Public (Read-Only)</SelectItem>
                            <SelectItem value="PUBLIC_EDIT" className="text-xs cursor-pointer">Public (Collaborative)</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            ) : (
                /* GUEST VIEW: Status badge  */
                <div className={`px-3 py-1.5 text-xs font-mono rounded-full border shadow-md flex items-center gap-2 backdrop-blur-sm border-dashed ${statusBadge.style}`}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    {statusBadge.text}
                </div>
            )}
        </div>
        
            <div className="flex gap-2 absolute top-2 left-1/2 -translate-x-1/2 px-4 py-3 bg-neutral-900 rounded shadow-lg">
                <ToolButton currentTool={currentTool} tool="circle" handleToolChange={handleToolChange} disabled={isReadOnly}>
                    <CircleIcon />
                </ToolButton>
                <ToolButton currentTool={currentTool} tool="line" handleToolChange={handleToolChange} disabled={isReadOnly}>
                    <LineIcon />
                </ToolButton>
                <ToolButton currentTool={currentTool} tool="rect" handleToolChange={handleToolChange} disabled={isReadOnly}>
                    <RectIcon />
                </ToolButton>
                <ToolButton currentTool={currentTool} tool="triangle" handleToolChange={handleToolChange} disabled={isReadOnly}>
                    <TriangleIcon />
                </ToolButton>
            </div>
      </div>
    </>
  );
}
