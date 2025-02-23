import { FastifyRequest, FastifyReply } from "fastify"
import { ListUsersService } from "../../services/userService/listUsersService"

class listUsersController{
    async handle(request: FastifyRequest, reply: FastifyReply){
        const listUsersService = new ListUsersService()
        const users = await listUsersService.execute()

        reply.send(users)
    }
}

export { listUsersController }