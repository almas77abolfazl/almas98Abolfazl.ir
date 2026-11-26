import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(/^\//, { message: 'url must start with /' })
  url!: string;
}
