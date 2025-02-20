import { FastifyRequest, FastifyReply } from "fastify"
import { DeleleUserService } from "../services/deleteUserService"

class DeleleUserController{
    async handle(request: FastifyRequest, reply: FastifyReply){
        
        const { id } = request.query as { id: string }
        const userService = new DeleleUserService()
        const user = await userService.execute({ id })

        reply.send(user)
    }
}
export { DeleleUserController }