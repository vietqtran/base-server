import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  I18nModule,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('DEFAULT_LANGUAGE'),
        loaderOptions: {
          path: path.join('src', 'i18n', 'locales'),
          watch: true,
        },
        supportedLanguages: ['en', 'cn', 'ja', 'vi'],
        fallbacks: {
          'cn-*': 'cn',
          'en-*': 'en',
          'vi-*': 'vi',
          'ja-*': 'ja',
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['response-language']),
      ],
      inject: [ConfigService],
    }),
  ],
  exports: [I18nModule],
})
export class I18nConfigModule {}
