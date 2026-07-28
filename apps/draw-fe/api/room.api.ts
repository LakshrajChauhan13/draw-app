import { AccessMode } from "@/app/component/RoomCanvas";
import { axiosTnstance } from "@/utils/axiosInstance";

export async function userSignUpApi(username: string, email: string, password: string){
    const response = await axiosTnstance.post('/signup', {
        username: username, 
        email: email,
        password: password
    });
    return response.data;
}

export async function userSignInApi( email: string, password: string ){
    const response = await axiosTnstance.post('/signin', {
        email: email,
        password: password
    });
    return response.data;
}

export async function createRoomApi(slug: string){
    // const token = localStorage.getItem('token')
    const response = await axiosTnstance.post('/room', {
        slug: slug,
    });
    return response.data;
}

export async function deleteRoomApi(id: string) {
    // const token = localStorage.getItem('token');
    const response = await axiosTnstance.delete(`/room/${id}`)
    return response.data;
}

export async function getExistingShapes(roomId: string, cookieHeader?: string){
    const response = await axiosTnstance.get(`/room/chats/${roomId}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined
    }
);
    const { messages, accessMode, admin } = response.data
    const shapes = messages.map((x : { message: string }) => {
        const message = JSON.parse(x.message)
        return message;
    })

    return {
        shapes, accessMode, admin
    };
}

export async function getAllRoomsApi() {
    const token = localStorage.getItem('token')
    const response = await axiosTnstance.get('/all/rooms')

    return response.data;
}

export async function isRoomExistsApi(roomId: string, cookieHeader?: string){
    try{
        const response = await axiosTnstance.get(`/check/${roomId}/`, {
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined
        })
        console.log(response.data)
        return response.data
    }catch(error: unknown){
        console.error("API Error in isRoomExistsApi:", error);
        throw error
    }
}

export async function toggleAccessModeApi(roomId: string, accessMode: AccessMode) {
    const response = await axiosTnstance.patch(`/room/${roomId}/access`, {
        accessMode: accessMode
    })

    return response.data;
}