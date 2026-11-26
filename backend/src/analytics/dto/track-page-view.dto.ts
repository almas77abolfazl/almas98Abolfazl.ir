import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  url!: string;
}
