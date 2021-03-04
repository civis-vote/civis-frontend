import {environment as prodEnv} from './environment.prod';

export const environment = {
    ...prodEnv,
    staging: true,
    production: false,
    api: 'http://gazelle.civis-api-jpmc-backend.staging.c66.me',
    RECAPTCHA_SITE_KEY: '6Ld8GLUUAAAAAH5CZbqDdQDwl-s5ZC2ZqHz5TWyj'
};
