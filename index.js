import express from 'express'
import 'dotenv/config'
import userRouter from './src/routes/user.route.js'

const port=process.env.PORT||3001

const app= express()
app.use(express.json())

app.get("", (request, response)=>{
    response.send("todo ok")
})

app.use("/api/user", userRouter)





app.listen(port, ()=>{
    console.log("http://localhost:"+port)
})