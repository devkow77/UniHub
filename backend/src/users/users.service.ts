import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  // Pobieranie wszystkich użytkowników

  async findAll(page = 1, limit = 20) {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));

    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          university: true,
          fieldOfStudy: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: safeLimit,
      }),
      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Pobieranie publicznego profilu użytkownika
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        university: true,
        fieldOfStudy: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    const { isActive, ...publicProfile } = user;

    return publicProfile;
  }

  // Tworzenie nowego użytkownika
  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser)
      throw new ConflictException('Email or username is already taken');

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        university: dto.university,
        fieldOfStudy: dto.fieldOfStudy,
        studyYear: dto.studyYear,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        university: true,
        fieldOfStudy: true,
        studyYear: true,
        createdAt: true,
      },
    });

    return user;
  }

  // Aktualizowanie profilu użytkownika
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Sprawdzamy, czy użytkownik istnieje
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Jeśli użytkownik zmienia username, sprawdzamy jego dostępność
    if (dto.username && dto.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Aktualizujemy profil
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        university: true,
        fieldOfStudy: true,
        studyYear: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Zmiana hasła użytkownika
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sprawdzamy aktualne hasło
    const isPasswordValid = await argon2.verify(
      user.password,
      dto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Nie pozwalamy ustawić tego samego hasła
    const isSamePassword = await argon2.verify(user.password, dto.newPassword);

    if (isSamePassword) {
      throw new ConflictException(
        'New password must be different from current password',
      );
    }

    // Hashujemy nowe hasło
    const hashedPassword = await argon2.hash(dto.newPassword);

    // Zmieniamy hasło i unieważniamy wszystkie refresh tokeny
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });

    const tokens = await this.authService.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Password changed successfully',
      ...tokens,
    };
  }
}
