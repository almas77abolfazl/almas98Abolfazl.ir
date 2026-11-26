import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  authorName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  authorNameFa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyRoleFa?: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  contentFa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  authorImageUrl?: string;
}
