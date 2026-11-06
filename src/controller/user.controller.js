import {createUserService, findUserService} from '../services/user.service.js'

export async function createUserController(req,res){
    res.status(200).send(await createUserService(req.body))
}

export async function findUserController(req, res){
    const user=await findUserService(req.body);

    console.log(user)
    res.status(user.status).json(user.message)
}
