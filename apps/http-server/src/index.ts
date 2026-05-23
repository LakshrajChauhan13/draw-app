import express from "express";
import bcrypt from "bcrypt";
import { client } from "@repo/db/client";
import { safeSignUpSchema, safeSignInSchema } from "@repo/common/types";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@repo/backend-common/config";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.post('/signup', async (req, res) => {
    const parsedBody = safeSignUpSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.json({
            message: "Invalid format",
            // errors: flattenError(parsedBody.error).
        })
    }
    const {username, email, password, photo } = parsedBody.data
    const hashedPassword = await bcrypt.hash(password, 5)

    try{
        const response = await client.user.create({
            data : {
                username: username,
                email: email,
                password: hashedPassword,
                photo: photo
            }
        })
    }catch(err){
        return res.json({
            message: "User already exists!!"
        })
    }
    
    return res.json({
        message: "User signed up successfully!"
    })
    
})

app.post('/signin', async (req, res) => {
    const parsedBody = safeSignInSchema.safeParse(req.body)
    if(!parsedBody.success){
        return res.json({
            message: "Invalid format",
            // errors: flattenError(parsedBody.error).
        })
    }
    const {email, password } = parsedBody.data

    const userFound = await client.user.findFirst({
        where: {
            email: email
        }
    })

    if(!userFound){
        return res.json({
            message: "User doesn't exists!!"
        })
    }

    const passwordMatch = await bcrypt.compare(password, userFound.password)
    if(!passwordMatch){
        return res.json({
            message: "Invalid Credentials! Plz try again..."
        })
    }

    const token = await jwt.sign({
        userId: userFound.id
    }, JWT_SECRET_KEY )        

    
    return res.json({
        message: "User signed in successfully!",
        token: token
    })
    
})


app.listen(3000, () => {
    console.log('server is running on the port 3000')
});