import { WebSocketServer } from "ws";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";

const wss = new WebSocketServer({port: 8080})

wss.on('connection', function(ws, request){
    const url = request.url;
    
    const queryParams = new URLSearchParams(url?.split('?')[1]);
    const token = queryParams.get('token');
    const decodedInfo = jwt.verify(token as string, JWT_SECRET_KEY); 
    
    if(!decodedInfo){
        ws.close();
        return;
    }

    ws.on('message', function message(data){
        ws.send('heya authenticated person welcome ')
    })
})