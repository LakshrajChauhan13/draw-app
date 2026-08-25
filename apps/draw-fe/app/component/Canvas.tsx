"use client";

import { renderCanvas, draw, Shapes } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { SendMessage } from "react-use-websocket";
import { CircleIcon, LineIcon, RectIcon, TriangleIcon } from "@/icons/icons";
import ToolButton from "./ShapesButton";
import { toast } from "sonner";
import { AccessMode } from "./RoomCanvas";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToggleModeAccess } from "../hooks/useToggleAccessModeMutation";
import { PrivateCanvasPage } from "./PrivateCanvasPage";
import { ChevronDown } from "lucide-react";

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

        <div className="absolute top-4 right-4 z-50 flex gap-2">
            {admin ? (
                /* Admin View: Clickable Dropdown Badge */
            <DropdownMenu>
                <DropdownMenuTrigger 
                    disabled={toggleAccessModeMutation.isPending}
                    className={`group h-8 px-4 py-5 text-sm font-mono tracking-tighter rounded-full border shadow-md flex items-center gap-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 border-dashed transition-all active:scale-95 ${statusBadge.style}`}
                >
                    {/* Pulsing Status Dot */}
                    <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    
                    {toggleAccessModeMutation.isPending ? "Updating..." : statusBadge.text}
                    <ChevronDown 
                        className="w-4 h-4 ml-1 opacity-60 transition-transform group-data-[popup-open]:rotate-180"
                        aria-hidden="true"
                    />
                </DropdownMenuTrigger>            
            
                <DropdownMenuContent align="end" className="w-56 font-mono">
                    <DropdownMenuRadioGroup 
                        value={localAccessMode} 
                        onValueChange={(value) => {
                            const newMode = value as AccessMode;
                            toggleAccessModeMutation.mutate({ roomId, accessMode: newMode }, {
                                onSuccess: () => {
                                    setLocalAccessMode(newMode);
                                    sendMessage(JSON.stringify({
                                        type: "access-mode-update",
                                        payload: { accessMode: newMode }
                                    }));
                                }
                            });
                        }}
                    >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Access Mode
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioItem value="PRIVATE" className="text-sm cursor-pointer py-2">
                        Private (Only You)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="PUBLIC_VIEW" className="text-sm cursor-pointer py-2">
                        Public (Read-Only)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="PUBLIC_EDIT" className="text-sm cursor-pointer py-2">
                        Public (Edit)
                    </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
    ) : (
        /* GUEST VIEW: Read-Only Static Badge */
        <div className={`h-10 px-4 text-sm font-mono rounded-full border shadow-md flex items-center gap-2 backdrop-blur-sm border-dashed ${statusBadge.style}`}>
            <span className="relative flex h-2 w-2 mr-1">
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
