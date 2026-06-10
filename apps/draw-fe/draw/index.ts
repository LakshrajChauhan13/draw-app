import { getExistingShapes } from "@/api/room.api"
import { useGlobalWebSocket } from "@/ContextAPI/WebSocketContextProvider"  
import { ReadyState, SendMessage } from "react-use-websocket"

export type Shapes = {
    type:   "rect",
    startX: number,
    startY: number,
    width:  number,
    height: number
} | {
    type:   "circle",
    startX: number,
    startY: number,
    radius:  number,
    startAngle: number
    endAngle: number
} | {
    type: "line",
    startX: number,
    startY: number
}

export function draw(canvas: HTMLCanvasElement, sendMessage: SendMessage, gotExistingShapes: Shapes[] ) {
        
        const existingShapes: Shapes[] = gotExistingShapes;
        const ctx = canvas.getContext("2d");
        if(!ctx){
            return;
        } 
                
        clearCanvas(ctx, canvas, existingShapes)
            
        let clicked = false;
        let startX = 0;
        let startY = 0;
        
        const onMouseDown = (e: MouseEvent) => {
            clicked = true;
            startX = e.clientX
            startY = e.clientY
        }

        const onMouseUp = (e: MouseEvent) => {
            clicked = false;
            const width  = e.clientX - startX; 
            const height = e.clientY - startY;
            const shape: Shapes = {
                type: "rect",
                startX: startX,
                startY: startY,
                height: height,
                width: width
            }
            existingShapes.push(shape)
            sendMessage(JSON.stringify({
                type: "draw",
                payload: {
                    shape: shape
                }
            }))
        }

        const onMouseMove = (e: MouseEvent) => {
            if(clicked){
                const width =  e.clientX - startX;
                const height =  e.clientY - startY;
                clearCanvas(ctx, canvas, existingShapes);
                ctx.strokeStyle = "rgba(255, 255, 255)"
                ctx?.strokeRect(startX, startY, width, height);
            }
        }

        canvas.addEventListener("mousedown", onMouseDown)
        canvas.addEventListener("mouseup", onMouseUp)
        canvas.addEventListener("mousemove", onMouseMove)

        return () => {
            canvas.removeEventListener("mousedown", onMouseDown)
            canvas.removeEventListener("mouseup", onMouseUp)
            canvas.removeEventListener("mousemove", onMouseMove)            
        }
        
}    


export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, existingShapes: Shapes[]  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0)" ; 
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    existingShapes.map((shape) => {
        if(shape.type === 'rect'){
            ctx.strokeStyle = "rgba(255, 255, 255)"
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height)
        }
    })

}