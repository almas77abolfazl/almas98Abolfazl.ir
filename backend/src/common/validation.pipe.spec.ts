import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateContactMessageDto } from '../contact-messages/dto/create-contact-message.dto';
import { CreateArticleDto, UpsertAboutMeDto } from '../admin/dto/admin.dto';

describe('Global ValidationPipe & DTOs', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  });

  it('whitelists valid contact message payload and strips unknown fields', async () => {
    const result = await pipe.transform(
      {
        name: 'Abolfazl',
        email: 'test@example.com',
        message: 'Hello!',
        extraInjectedField: 'should-be-stripped',
      },
      { type: 'body', metatype: CreateContactMessageDto },
    );

    expect(result).toEqual({
      name: 'Abolfazl',
      email: 'test@example.com',
      message: 'Hello!',
    });
    expect((result as any).extraInjectedField).toBeUndefined();
  });

  it('rejects invalid email in CreateContactMessageDto', async () => {
    await expect(
      pipe.transform(
        { name: 'Abolfazl', email: 'not-an-email', message: 'Hello!' },
        { type: 'body', metatype: CreateContactMessageDto },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects missing required title in CreateArticleDto', async () => {
    await expect(
      pipe.transform(
        { slug: 'my-post', content: 'Body' },
        { type: 'body', metatype: CreateArticleDto },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows empty optional email in UpsertAboutMeDto', async () => {
    const result = await pipe.transform(
      { fullName: 'Abolfazl', title: 'Engineer', email: '' },
      { type: 'body', metatype: UpsertAboutMeDto },
    );
    expect(result.fullName).toBe('Abolfazl');
  });
});
