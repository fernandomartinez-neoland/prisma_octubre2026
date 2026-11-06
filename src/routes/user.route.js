import express from 'express'
import { createUserController, findUserController } from '../controller/user.controller.js'

const router=express.Router()


router.post("/create",createUserController)
router.post("/finduser", findUserController)


export default router