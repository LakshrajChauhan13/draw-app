"use client";

import { clearCanvas, draw, Shapes } from "@/draw";
import { useEffect, useRef } from "react";
import { ReadyState, SendMessage } from "react-use-websocket";

export function Canvas({ roomId, sendMessage, lastMessage, gotExistingShapes }: {
    roomId: number;
    sendMessage: SendMessage;
    lastMessage: MessageEvent<any> | null;
    gotExistingShapes: Shapes[];
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
        
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const initDraw = draw(canvas, sendMessage, gotExistingShapes);
        sendMessage(JSON.stringify({
            type: "join",
            payload: {
                roomId: roomId
            }
        }))
        return initDraw;    //clean up function
    }, []);

    useEffect(() => {
        if(!lastMessage || !canvasRef.current) return;
        const data = JSON.parse(lastMessage.data);

        if(data.type === 'received' && data.payload.drawing){
            gotExistingShapes.push(data.payload.drawing);
        }
        const ctx = canvasRef.current?.getContext("2d")!
        clearCanvas(ctx, canvasRef.current, gotExistingShapes )
    },[lastMessage])

const buttonStyles = "px-4 py-2 border ";
  return (
    <>
      <canvas ref={canvasRef} width={1660} height={1080}></canvas>
    </>
  );
}
