import {environment as prodEnv} from './environment.prod';

export const environment = {
    ...prodEnv,
    staging: true,
    production: false,
     // api: 'https://api-staging.civis.vote',
    //  api: 'http://localhost:3000',
     api: 'https://hare.civis-jpmc-ffgdev-2022.staging.c66.me',
    RECAPTCHA_SITE_KEY: '6Ld8GLUUAAAAAH5CZbqDdQDwl-s5ZC2ZqHz5TWyj'
};
