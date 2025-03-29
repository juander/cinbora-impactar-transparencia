import { GetExternalDataService } from "@modules/authAPI";
import { CustomError } from "@shared/customError";
import { JWTService } from "@shared/jwtService";
import { CreateUserService, GetUserService } from "@modules/user";
import { CreateOngService, GetOngService } from "@modules/ong";
import { GetActionService } from "@modules/action";
import { FastifyInstance } from "fastify";
import { invalidateCache } from "@middlewares/cacheMiddleware";

class AuthController {
  private getExternalDataService: GetExternalDataService;
  private createUserService: CreateUserService;
  private getUserService: GetUserService;
  private createOngService: CreateOngService;
  private getOngService: GetOngService;
  private getActionService: GetActionService;
  private jwtService: JWTService;
  private fastify: FastifyInstance;

  constructor(
    getExternalDataService: GetExternalDataService,
    createUserService: CreateUserService,
    getUserService: GetUserService,
    createOngService: CreateOngService,
    getOngService: GetOngService,
    getActionService: GetActionService,
    jwtService: JWTService,
    fastify: FastifyInstance
  ) {
    this.getExternalDataService = getExternalDataService;
    this.createUserService = createUserService;
    this.getUserService = getUserService;
    this.createOngService = createOngService;
    this.getOngService = getOngService;
    this.getActionService = getActionService;
    this.jwtService = jwtService;
    this.fastify = fastify;
  }

  async authenticate(email: string, password: string) {
    try {
      const data = await this.getExternalDataService.execute({ email, password });

      if (!data.ngo) {
        throw new CustomError("Nenhuma ONG encontrada para este usuário.", 400);
      }

      const ngoData = data.ngo;
      const userData = data.user;

      let ngo = await this.getOngService.executeById(ngoData.id);
      let isNewNgo = false;

      if (!ngo) {
        ngo = await this.createOngService.execute({
          id: ngoData.id,
          name: ngoData.name,
          description: ngoData.description,
          is_formalized: ngoData.is_formalized,
          start_year: ngoData.start_year,
          contact_phone: ngoData.contact_phone,
          instagram_link: ngoData.instagram_link,
          x_link: ngoData.x_link,
          facebook_link: ngoData.facebook_link,
          pix_qr_code_link: ngoData.pix_qr_code_link,
          site: ngoData.site,
          gallery_images_url: ngoData.gallery_images_url,
          skills: ngoData.skills,
          causes: ngoData.causes,
          sustainable_development_goals: ngoData.sustainable_development_goals,
        });
        isNewNgo = true;
        
        // Invalidar o cache da lista de ONGs quando uma nova ONG é criada
        await invalidateCache(this.fastify, `ongs:list`);
        this.fastify.log.info(`Cache de lista de ONGs invalidado após criação da ONG ${ngoData.id}`);
      }

      let user = await this.getUserService.executeByEmail(userData.email);

      if (!user) {
        user = await this.createUserService.execute({
          name: userData.name,
          email: userData.email,
          ngoId: ngo.id,
        });
      }

      const token = this.jwtService.generateToken({ userId: user.id, name: user.name, email: user.email, ngoId: user.ngoId, profileUrl: user.profileUrl });

      // Buscar ações da ONG
      const actions = await this.getActionService.executeByNgoId(ngo.id.toString());

      return { user, ngo, token, actions };
    } catch (error) {
      console.error("Erro durante a autenticação:", error);
      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro interno ao autenticar usuário", 500);
      }
    }
  }
}

export { AuthController };