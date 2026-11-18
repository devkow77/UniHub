import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './login.dto.js';
import { ensureCsrfSession, generateCsrfToken } from './csrf.js';

const ACCESS_COOKIE_NAME = 'unihub_access';
const REFRESH_COOKIE_NAME = 'unihub_refresh';

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf')
  getCsrfToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Upewniamy się, że sesja CSRF istnieje
    if (!request.cookies?.unihub_csrf_session) {
      ensureCsrfSession(request, response, () => {});
    }

    const csrfToken = generateCsrfToken(request, response);

    return { csrfToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);

    response.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);

    response.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh(refreshToken);

    response.cookie(
      ACCESS_COOKIE_NAME,
      result.accessToken,
      accessCookieOptions,
    );

    response.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      refreshCookieOptions,
    );

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      response.clearCookie(ACCESS_COOKIE_NAME, {
        ...accessCookieOptions,
        maxAge: undefined,
      });
      response.clearCookie(REFRESH_COOKIE_NAME, {
        ...refreshCookieOptions,
        maxAge: undefined,
      });

      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.logout(refreshToken);

    response.clearCookie(ACCESS_COOKIE_NAME, {
      ...accessCookieOptions,
      maxAge: undefined,
    });

    response.clearCookie(REFRESH_COOKIE_NAME, {
      ...refreshCookieOptions,
      maxAge: undefined,
    });

    return result;
  }
}
