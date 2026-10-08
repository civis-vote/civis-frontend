import {environment as prodEnv} from './environment.prod';

export const environment = {
    ...prodEnv,
    staging: true,
    production: false,
    api: 'https://api-staging.civis.vote',
    v2FrontendUrl: 'https://staging.v2.civis.vote',
    v2StoragePrefix: 'civis-v2-staging',
    RECAPTCHA_SITE_KEY: '6Ld8GLUUAAAAAH5CZbqDdQDwl-s5ZC2ZqHz5TWyj'
};
