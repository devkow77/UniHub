import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  Matches,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  university?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fieldOfStudy?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  studyYear?: number;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
