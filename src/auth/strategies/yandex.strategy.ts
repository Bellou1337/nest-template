import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-yandex';
import { ConfigService } from '@nestjs/config';
import type {
  YandexProfile,
  YandexOauthData,
} from '../types/yandex-oauth.types';
@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('YANDEX_CLIENT_ID')!,
      clientSecret: configService.get<string>('YANDEX_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('YANDEX_CALLBACK_URL')!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: YandexProfile,
  ): Promise<YandexOauthData> {
    const { id, emails, display_name } = profile._json;

    return {
      provider: 'yandex',
      providerId: id,
      email:
        emails?.[0] ||
        profile.emails?.[0]?.value ||
        `yandex_${id}@oauth.placeholder`,
      name: display_name || `yandex_user_${id}`,
    };
  }
}
