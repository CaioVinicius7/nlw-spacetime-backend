import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    payload: {
      name: string;
      avatarUrl: string;
    };
    user: {
      sub: string;
      name: string;
      avatarUrl: string;
    };
  }
}
