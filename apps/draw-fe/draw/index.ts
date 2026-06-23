import { ShapeType } from "@/app/component/Canvas"
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
}

export function draw(
    canvas: HTMLCanvasElement, 
    sendMessage: SendMessage, 
    gotExistingShapes: Shapes[],
    currentTool: ShapeType 
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
                    const radius = Math.sqrt(Math.pow(coords.x - startX, 2) + Math.pow(coords.y - startY, 2));
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
        }else if(shape.type === 'circle'){
            const width = shape.endX - shape.startX;
            const height = shape.endY - shape.startY;
            const centreX = (shape.startX + shape.endX) / 2;
            const centreY = (shape.startY + shape.endY) / 2;
            const radiusX = Math.abs(width) / 2;
            const radiusY = Math.abs(height) / 2
            
            ctx.beginPath();
            ctx.ellipse(centreX, centreY, radiusX, radiusY, 0, 0, Math.PI * 2 );
            ctx.stroke()
        }else{
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke()
        }
    })

    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"; // Highlight with Excalidraw blue color matching drag vectors
    ctx.setLineDash([6, 6]); // Use dashed layout outline to signal ongoing actions
    
    if (activePreview && activePreview.type === 'rect') {
        ctx.strokeRect(activePreview.startX, activePreview.startY, activePreview.width, activePreview.height);
    }
    else if (activePreview && activePreview.type === 'circle') {
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
    if (activePreview && activePreview.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(activePreview.startX, activePreview.startY);
        ctx.lineTo(activePreview.endX, activePreview.endY);
        ctx.stroke();
    }
    
    ctx.setLineDash([]); // Reset line style settings
}