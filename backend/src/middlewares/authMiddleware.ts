import { FastifyRequest, FastifyReply } from "fastify";
import { JWTService } from "@shared/jwtService";

const jwtService = new JWTService();

type User = {
  id: string;
  name: string;
  email: string;
  ngoId: number;
  profileUrl: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: User; 
  }
}

async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  //console.log("Cookies recebidos:", request.cookies); // Log dos cookies recebidos

  //const authHeader = request.headers.authorization;
  //const token = authHeader?.split(" ")[1] || request.cookies.auth_token;

  //console.log("Token recebido:", token); // Log do token recebido

  //if (!token) {
  //  console.log("Token não fornecido");
  //  reply.status(401).send({ error: "Token not provided" });
  //  return;
  //}

  //try {
    //const decoded = jwtService.verifyToken(token);
    //console.log("Token decodificado:", decoded); // Log do token decodificado

    //if (typeof decoded === 'string') {
    //  reply.status(401).send({ error: "Invalid token" });
    //  return;
    //}

    //request.user = {
    //  id: decoded.userId,
    //  name: decoded.name,
    //  email: decoded.email,
    //  ngoId: decoded.ngoId,
    //  profileUrl: decoded.profileUrl,
    //};

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      reply.status(401).send({ error: "Token not provided" });
      return;
    }

    const [, token] = authHeader.split(" ");

    try {
      const decoded = jwtService.verifyToken(token);

      if (typeof decoded === 'string') {
        reply.status(401).send({ error: "Invalid token" });
        return;
      }

    request.user = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      ngoId: decoded.ngoId,
      profileUrl: decoded.profileUrl,
    };
  } catch (error) {
    console.log("Erro ao verificar o token:", error); // Log do erro
    reply.status(401).send({ error: "Invalid token" });
  }
}

export { authMiddleware };