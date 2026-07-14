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
    const token = localStorage.getItem('token')
    const response = await axiosTnstance.post('/room', {
        slug: slug,
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}

export async function getExistingShapes(roomId: number){
    const token = localStorage.getItem('token')
    const response = await axiosTnstance.get(`/room/chats/${roomId}`, {
        headers: {                                                              // hardcoded the token for now
            Authorization: `Bearer ${token}`
        }
    });
    
    const messages = response.data.messages;
    const shapes = messages.map((x : { message: string }) => {
        const message = JSON.parse(x.message)
        return message;
    })

    return shapes;
}

export async function getAllRoomsApi() {
    const token = localStorage.getItem('token')
    const response = await axiosTnstance.get('/all/rooms', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return response.data;
}