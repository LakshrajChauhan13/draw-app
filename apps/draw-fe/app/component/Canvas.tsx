"use client";

import { renderCanvas, draw, Shapes } from "@/draw";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";
import { ReadyState, SendMessage } from "react-use-websocket";
import { CircleIcon, LineIcon, RectIcon, TriangleIcon } from "@/icons/icons";
import ToolButton from "./ShapesButton";

export type ShapeType = "rect" | "line" | "circle" | "triangle";

export function Canvas({ roomId, sendMessage, lastMessage, gotExistingShapes }: {
    roomId: number;
    sendMessage: SendMessage;
    lastMessage: MessageEvent<any> | null;
    gotExistingShapes: Shapes[];
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const collaboratorPreviewRef = useRef<Shapes | null>(null)
    const [currentTool, setCurrentTool] = useState<ShapeType>('rect')                         // const currentToolRef = useRef<ShapeType>("rect")
    const currentToolRef= useRef<ShapeType>('rect')                         // const currentToolRef = useRef<ShapeType>("rect")
    
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
        const initDraw = draw(canvas, sendMessage, gotExistingShapes, currentToolRef);
        return initDraw;    //clean up function
    }, []);

    useEffect(() => {
        if(!lastMessage || !canvasRef.current) return;
        const data = JSON.parse(lastMessage.data);
        const ctx = canvasRef.current?.getContext("2d")!
        try{
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
        }catch(error){
            console.error("Payload synchronization error exception:", error);
        }

    },[lastMessage, gotExistingShapes])

    const buttonStyles: string = "text-xs bg-neutral-500/50 text-neutral-400 px-2 py-1.5 rounded cursor-pointer  border-1 border-neutral-500/50  active:bg-neutral-500 active hover:text-neutral-200 hover:border-white active:scale-95 transition-all duration-75 ";
    const buttonActiveState = 'border-white text-neutral-200 bg-neutral-500'

    const handleToolChange = (tool: ShapeType) => {
        currentToolRef.current = tool;
        setCurrentTool(tool)
    }
    
  return (
    <>
      <div className="relative">
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="absolute"></canvas>
        <div className="flex gap-2 absolute top-2 left-1/2 -translate-x-1/2 px-4 py-3 bg-neutral-900 rounded " >
            {/* <button onClick={ () => { handleToolChange('circle') }} className={cn(` ${buttonStyles} ${currentTool === 'circle' && buttonActiveState } `)}>
                <CircleIcon />
            </button>
            <button onClick={ () => { handleToolChange('line') }} className={cn(` ${buttonStyles} ${currentTool === 'line' && buttonActiveState } `)}>
                <LineIcon />
            </button>
            <button onClick={ () => { handleToolChange('rect') }} className={cn(` ${buttonStyles} ${currentTool === 'rect' && buttonActiveState } `)}>
                <RectIcon />
            </button>
            <button onClick={ () => { handleToolChange('triangle') }} className={cn(` ${buttonStyles} ${currentTool === 'triangle' && buttonActiveState } `)}>
                <TriangleIcon />
            </button> */}
            <ToolButton currentTool={currentTool} tool="circle" handleToolChange={handleToolChange}>
                <CircleIcon />
            </ToolButton>
            <ToolButton currentTool={currentTool} tool="line" handleToolChange={handleToolChange}>
                <LineIcon />
            </ToolButton>
            <ToolButton currentTool={currentTool} tool="rect" handleToolChange={handleToolChange}>
                <RectIcon />
            </ToolButton>
            <ToolButton currentTool={currentTool} tool="triangle" handleToolChange={handleToolChange}>
                <TriangleIcon />
            </ToolButton>
        </div>
      </div>
    </>
  );
}
