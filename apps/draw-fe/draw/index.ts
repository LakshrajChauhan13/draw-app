import { ShapeType } from "@/app/component/Canvas"
import { RefObject } from "react"
import { SendMessage } from "react-use-websocket"

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
    endX: number
    endY: number
} | {
    type: "line",
    startX: number,
    startY: number,
    endX: number,
    endY: number
} | {
    type: "triangle",
    startX: number,
    startY: number,
    endX: number,
    endY: number
}

export function draw(
    canvas: HTMLCanvasElement, 
    sendMessage: SendMessage, 
    gotExistingShapes: Shapes[],
    currentToolRef: RefObject<ShapeType> 
    ) {
        const existingShapes: Shapes[] = gotExistingShapes;
        const ctx = canvas.getContext("2d");
        if(!ctx){
            return;
        } 
        
        const getLocalCoordinates = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            }
        };
                
        renderCanvas(ctx, canvas, existingShapes, null)
            
        let clicked = false;
        let startX = 0;
        let startY = 0;
        
        const onMouseDown = (e: MouseEvent) => {
            clicked = true;
            const coords = getLocalCoordinates(e);
            startX = coords.x;
            startY = coords.y;
        }

        const onMouseUp = (e: MouseEvent) => {
            clicked = false;
            const coords = getLocalCoordinates(e);
            const width  = coords.x - startX; 
            const height = coords.y - startY;
            const currentTool = currentToolRef.current;
            let shape: Shapes
            
            switch (currentTool) {
                case "rect": 
                    shape = {
                        type: "rect",
                        startX: startX,
                        startY: startY,
                        height: height,
                        width: width
                    }
                    break;

                case "circle": 
                    shape = {
                        type: "circle",
                        startX: startX,
                        startY: startY,
                        endX: coords.x ,
                        endY: coords.y 
                    }
                    break;

                case "line": 
                    shape = {
                        type: "line",
                        startX: startX,
                        startY: startY,
                        endX: coords.x,
                        endY: coords.y,
                    }
                    break;

                case "triangle": 
                    shape = {
                        type: "triangle",
                        startX: startX,
                        startY: startY,
                        endX: coords.x,
                        endY: coords.y,
                    }
                    break;
            }
            
            existingShapes.push(shape)
            sendMessage(JSON.stringify({ type: "clear-preview" }));
            renderCanvas(ctx, canvas, existingShapes, null)
            sendMessage(JSON.stringify({
                type: "draw",
                payload: {
                    shape: shape
                }
            }));
        }

        const onMouseMove = (e: MouseEvent) => {
            if(clicked){
                const coords = getLocalCoordinates(e);
                const width =  coords.x - startX;
                const height =  coords.y - startY;
                const currentTool = currentToolRef.current;

                let localPreview: Shapes;
                
                switch (currentTool){
                case "rect": 
                    localPreview = {
                        type: "rect",
                        startX: startX,
                        startY: startY,
                        height: height,
                        width: width
                    }
                    break;

                case "circle": 
                    const radius = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
                    localPreview = {
                        type: "circle",
                        startX: startX,
                        startY: startY,
                        endX: coords.x,
                        endY: coords.y 
                    }
                    break;

                case "line": 
                    localPreview = {
                        type: "line",
                        startX: startX,
                        startY: startY,
                        endX: coords.x,
                        endY: coords.y
                    }
                    break;

                case "triangle": 
                    localPreview = {
                        type: "triangle",
                        startX: startX,
                        startY: startY,
                        endX: coords.x,
                        endY: coords.y
                    }
                    break;
            }

            renderCanvas(ctx, canvas, existingShapes, localPreview);
            ctx.strokeStyle = "rgba(255, 255, 255)"
            // ctx?.strokeRect(startX, startY, width, height);

            sendMessage(JSON.stringify({
                type: "draw-preview",
                payload:{ 
                    previewShape: localPreview 
                }
            }));
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

export function renderCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, existingShapes: Shapes[], activePreview: Shapes | null){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.forEach((shape) => {
        ctx.strokeStyle = "rgba(255, 255, 255)";
        if(shape.type === 'rect'){
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        }
        else if(shape.type === 'circle'){
            const width = shape.endX - shape.startX;
            const height = shape.endY - shape.startY;
            const centreX = (shape.startX + shape.endX) / 2;
            const centreY = (shape.startY + shape.endY) / 2;
            const radiusX = Math.abs(width) / 2;
            const radiusY = Math.abs(height) / 2
            
            ctx.beginPath();
            ctx.ellipse(centreX, centreY, radiusX, radiusY, 0, 0, Math.PI * 2 );
            ctx.stroke()
        }
        else if(shape.type === 'line'){
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke()
        }
        else {                      //
            drawTrianglePath(ctx, shape.startX, shape.startY, shape.endX, shape.endY)
        }
    })

    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"; // for higlighting the ongoing action
    ctx.setLineDash([6, 6]); // using dashed layout outline to signal ongoing actions
    
    if(activePreview) {
        if (activePreview.type === 'rect') {
            ctx.strokeRect(activePreview.startX, activePreview.startY, activePreview.width, activePreview.height);
    }
    else if (activePreview.type === 'circle') {
        const width = activePreview.endX - activePreview.startX;
        const height = activePreview.endY - activePreview.startY;
        const centreX = (activePreview.startX + activePreview.endX) / 2;
        const centreY = (activePreview.startY + activePreview.endY) / 2;
        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2
        
        ctx.beginPath();
        ctx.ellipse(centreX, centreY, radiusX, radiusY, 0, 0, Math.PI * 2 );
        ctx.stroke();
    }
    else if (activePreview.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(activePreview.startX, activePreview.startY);
        ctx.lineTo(activePreview.endX, activePreview.endY);
        ctx.stroke();
    }
    else{
        drawTrianglePath(ctx, activePreview?.startX, activePreview?.startY, activePreview?.endX, activePreview?.endY)
    }
}
    ctx.setLineDash([]); // Reset line style settings
}

function drawTrianglePath(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    const topX = (startX + endX) / 2;
    const topY = startY;
    
    ctx.beginPath();
    ctx.moveTo(topX, topY);       // Top peak
    ctx.lineTo(endX, endY);       // Bottom Right
    ctx.lineTo(startX, endY);     // Bottom Left
    ctx.closePath();              // Back to Top peak
    ctx.stroke();
}
