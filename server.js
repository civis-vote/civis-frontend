const express = require('express');
const app = express();
const contentSecurityPolicy = require('helmet-csp');
const path = require('path');
// const secure = require('ssl-express-www');
const compression = require('compression');
const disqusRouter = require('./server-app/disqus');
const s3Proxy = require('s3-proxy');

if(!process.env.APP_ENVIRONMENT) {
    require('dotenv').config();
}

// app.use(secure);

app.use(function (req, res, next) {
  if (!req.secure && process.env.APP_ENVIRONMENT === "production") {
    res.redirect("https://" + req.headers.host + req.url);
  } else return next();
});

app.use(
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://unpkg.com",
        "https://cdn.ckeditor.com",
        "https://edge.fullstory.com",
        "https://client.crisp.chat",
        "https://cdn.ckeditor.com",
      ],
      baseUri: ["'self'"],
      objectSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://client.crisp.chat",
        "https://unpkg.com",
      ],
      fontSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.gstatic.com",
        "https://client.crisp.chat",
      ],
      frameAncestors: ["'self'"],
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://rs.fullstory.com",
        "https://api-staging.civis.vote",
        "wss://client.relay.crisp.chat",
        "sentry.io",
        "https://*.sentry.io",
        "*.sentry.io",
      ],
      imgSrc: ["'self'", "https://*", "data:", "https://storage.googleapis.com"],
      formAction: ["'self'"],
    },
    reportOnly: false,
  })
);

const PORT = process.env.PORT || 3401;
app.listen(PORT);

app.use(compression());

app.use(express.static(__dirname + '/dist/civis'));

app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
});

app.use('/disqus', disqusRouter);

app.get('/getEnvironment', (req, res) => {
    const environment = process.env;
    res.status(200).json({environment});
});

const s3BucketOptions = {
    bucket: `civis-sitemaps-${process.env.APP_ENVIRONMENT === 'staging' ? 'staging' : 'production'}`,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    overrideCacheControl: 'max-age=100000',
}

app.get('/sitemap.xml.gz', s3Proxy({...s3BucketOptions, defaultKey: 'sitemap.xml.gz'}));

const sitemapRouter = express.Router({mergeParams: true});  // Nest rest of the files and folders in s3 bucket under '/sitemaps' path.
app.use('/sitemaps', sitemapRouter);
sitemapRouter.get('*', s3Proxy(s3BucketOptions));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/civis/index.html'));
});

console.log("listing on port", PORT);
