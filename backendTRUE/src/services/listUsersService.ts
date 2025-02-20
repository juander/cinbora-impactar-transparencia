import prismaClient from "../prisma"

class ListUsersService{
    async execute(){

        const users = await prismaClient.user.findMany()

        return users
    }
}
export { ListUsersService }