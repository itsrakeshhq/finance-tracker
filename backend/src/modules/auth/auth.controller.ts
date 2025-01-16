import { TRPCError } from "@trpc/server";
import Cookies, { SetOption } from "cookies";
import { AuthenticatedContext, Context } from "../../trpc";
import { redis } from "../../utils/redis";
import { users } from "../user/user.schema";
import AuthService from "./auth.service";

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const accessTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions: SetOption = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default class AuthController extends AuthService {
  async loginHandler(data: typeof users.$inferInsert, ctx: Context) {
    const { accessToken, refreshToken } = await super.login(data);

    const cookies = new Cookies(ctx.req, ctx.res, {
      secure: process.env.NODE_ENV === "production",
    });
    cookies.set("accessToken", accessToken, { ...accessTokenCookieOptions });
    cookies.set("refreshToken", refreshToken, {
      ...refreshTokenCookieOptions,
    });
    cookies.set("logged_in", "true", { ...accessTokenCookieOptions });

    return { success: true };
  }

  async registerHandler(data: typeof users.$inferInsert) {
    return await super.register(data);
  }

  async refreshAccessTokenHandler(ctx: AuthenticatedContext) {
    const cookies = new Cookies(ctx.req, ctx.res, {
      secure: process.env.NODE_ENV === "production",
    });

    const refreshToken = cookies.get("refreshToken");
    if (!refreshToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Refresh token is required",
      });
    }

    const accessToken = await super.refreshAccessToken(refreshToken);

    cookies.set("accessToken", accessToken, { ...accessTokenCookieOptions });
    cookies.set("logged_in", "true", { ...accessTokenCookieOptions });

    return { success: true };
  }

  async logoutHandler(ctx: AuthenticatedContext) {
    const { req, res, user } = ctx;

    try {
      const cookies = new Cookies(req, res, {
        secure: process.env.NODE_ENV === "production",
      });
      const refreshToken = cookies.get("refreshToken");

      if (refreshToken) {
        await redis.del(`refresh_token:${refreshToken}`);
        await redis.srem(`refresh_tokens:${user.id}`, refreshToken);
      }

      cookies.set("accessToken", "", { ...accessTokenCookieOptions });
      cookies.set("refreshToken", "", { ...refreshTokenCookieOptions });
      cookies.set("logged_in", "false", { ...accessTokenCookieOptions });

      return { success: true };
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }

  async logoutAllHandler(ctx: AuthenticatedContext) {
    const { req, res, user } = ctx;

    try {
      const refreshTokens = await redis.smembers(`refresh_tokens:${user.id}`);

      const pipeline = redis.pipeline();

      refreshTokens.forEach((refreshToken) => {
        pipeline.del(`refresh_token:${refreshToken}`);
      });
      pipeline.del(`refresh_tokens:${user.id}`);
      pipeline.del(`user:${user.id}`);

      await pipeline.exec();

      const cookies = new Cookies(req, res, {
        secure: process.env.NODE_ENV === "production",
      });
      cookies.set("accessToken", "", { ...accessTokenCookieOptions });
      cookies.set("refreshToken", "", { ...refreshTokenCookieOptions });
      cookies.set("logged_in", "false", { ...accessTokenCookieOptions });

      return { success: true };
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }
}
