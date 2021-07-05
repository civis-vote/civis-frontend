import {environment as prodEnv} from './environment.prod';

export const environment = {
    ...prodEnv,
    staging: true,
    production: false,
    api: 'https://civis-api-jpmc-backend.staging-9143.c66.me',
    RECAPTCHA_SITE_KEY: '6Ld8GLUUAAAAAH5CZbqDdQDwl-s5ZC2ZqHz5TWyj'
};