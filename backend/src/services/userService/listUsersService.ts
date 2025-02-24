import prismaClient from "../../prisma/prismaClient"

class ListUsersService{
    async execute(){

        const users = await prismaClient.user.findMany()

        return users
    }
}
export { ListUsersService }