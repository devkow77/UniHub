import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto.js';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Logowanie użytkownika i generowanie tokenów
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email or password');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Odświeżanie tokenu bez logowania
  async refresh(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      !storedToken.user.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generujemy nowy refresh token
    const newRefreshToken = this.generateRefreshToken();
    const newTokenHash = this.hashToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = await this.jwtService.signAsync({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Atomowo unieważniamy stary token i zapisujemy nowy
    await this.prisma.$transaction(async (tx) => {
      const result = await tx.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await tx.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          userId: storedToken.user.id,
          expiresAt,
        },
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Wylogowanie użytkownika
  async logout(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      message: 'Successfully logged out',
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
