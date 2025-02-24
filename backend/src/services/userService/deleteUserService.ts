import prismaClient from "../../prisma/prismaClient"

interface DeleteUserProps{
    id: string
}
class DeleleUserService{
    async execute({ id }: DeleteUserProps){
        if(!id){
            throw new Error("Delete failed, no ID")
        }
        const findUser = await prismaClient.user.findFirst({
            where:{
                id: id
            }
        }) 
        if(!findUser){
            throw new Error("Client no exist")
        }
        await prismaClient.user.delete({
            where:{
                id: findUser.id
            }
        })

        return { message: "Client deleted"}
    }
}

export { DeleleUserService }