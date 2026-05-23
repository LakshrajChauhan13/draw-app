import express from "express";
import bcrypt from "bcrypt";
import { client } from "@repo/prisma/client";
import { safeSignUpSchema, safeSignInSchema } from "@repo/common/types";

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
    const {username, email, password } = parsedBody.data
    const hashedPassword = await bcrypt.hash(password, 5)

    try{
        const response = await client.user.create({
            data : {
                username: username,
                email: email,
                password: hashedPassword
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



app.listen(3000, () => {
    console.log('server is running on the port 3000')
});