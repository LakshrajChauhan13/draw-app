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
    const response = await axiosTnstance.post('/room', {
        slug: slug
    });
    return response.data;
}

export async function getExistingShapes(roomId: number){
    const response = await axiosTnstance.get(`/room/chats/${roomId}`, {
        headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMjc1YWIwOS0zZjlkLTRjYjUtODQ3YS1mZWRiMDcxMjBkNGUiLCJpYXQiOjE3ODEwNDEyNjR9.dXWGUWQjmAHD0AlzFU5x0jSEhRzQljgIj58dctEHPRg`
        }
    });
    const messages = response.data.messages;

    const shapes = messages.map((x : { message: string }) => {
        const message = JSON.parse(x.message)
        return message;
    })

    return shapes;
}