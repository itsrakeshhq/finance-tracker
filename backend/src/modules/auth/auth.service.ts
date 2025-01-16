import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../../utils/db";
import { redis } from "../../utils/redis";
import { users } from "../user/user.schema";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export default class AuthService {
  createAccessToken(userId: number) {
    const accessToken = jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    return accessToken;
  }

  createRefreshToken(userId: number) {
    const refreshToken = jwt.sign({ sub: userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    return refreshToken;
  }

  verifyAccessToken(accessToken: string) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
        sub: string;
      };

      return decoded.sub;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  verifyRefreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        sub: string;
      };

      return decoded.sub;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  async login(data: typeof users.$inferInsert) {
    const { email, password } = data;

    try {
      const user = (
        await db.select().from(users).where(eq(users.email, email)).limit(1)
      )[0];

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const accessToken = this.createAccessToken(user.id);
      const refreshToken = this.createRefreshToken(user.id);

      // Store refresh token in redis
      await redis.set(
        `refresh_token:${refreshToken}`,
        user.id,
        "EX",
        7 * 24 * 60 * 60 // 7 days
      );

      // Store refresh token in redis set to track active sessions
      await redis.sadd(`refresh_tokens:${user.id}`, refreshToken);
      await redis.expire(`refresh_tokens:${user.id}`, 7 * 24 * 60 * 60); // 7 days

      // Store user in redis to validate session
      await redis.set(
        `user:${user.id}`,
        JSON.stringify(user),
        "EX",
        7 * 24 * 60 * 60
      ); // 7 days

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Something went wrong",
      });
    }
  }

  async register(data: typeof users.$inferInsert) {
    try {
      const { email, password } = data;

      const user = (
        await db.select().from(users).where(eq(users.email, email)).limit(1)
      )[0];
      if (user) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This email is associated with an existing account. Please login instead.",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
        })
        .returning();

      return {
        success: true,
        user: newUser,
      };
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const isTokenExist = await redis.get(`refresh_token:${refreshToken}`);
      if (!isTokenExist) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }

      const userId = this.verifyRefreshToken(refreshToken);
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }

      const accessToken = this.createAccessToken(parseInt(userId));

      return accessToken;
    } catch (error) {
      console.log(error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }
}
