    "use client"

    import { createContext, ReactNode, useContext } from "react"
    import useWebSocket, { ReadyState, SendMessage } from "react-use-websocket"

    interface WebSocketContextInterface {
        lastMessage: MessageEvent<any> | null;
        sendMessage: SendMessage;
        readyState: ReadyState;
        connectionStatus?: string;
    }

    const webSocketContext = createContext<WebSocketContextInterface | null>(null)

    const WebSocketContextProvider = ({children} : { children: ReactNode}) => {

        const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:8080", {
            shouldReconnect: () => true
        })

        const connectionStatus = {
            [ReadyState.CONNECTING]: 'Connecting',
            [ReadyState.OPEN]: 'Open',
            [ReadyState.CLOSING]: 'Closing',
            [ReadyState.CLOSED]: 'Closed',
            [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState as ReadyState];
        
    return (
        <webSocketContext.Provider value={{ sendMessage, lastMessage, readyState, connectionStatus}}>
            {children}
        </webSocketContext.Provider>
    )
    }

    export default WebSocketContextProvider


    export const useGlobalWebSocket = () => {
        const context = useContext(webSocketContext);
        if(!context){
            throw new Error("useGlobalWebSocket should be used inside the WebSocketContextProvider")
        }
        return context
    }