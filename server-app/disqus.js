const Router =  require('express').Router;
const bodyParser = require('body-parser');
const disqusRouter = Router();
const CryptoJS = require('crypto-js');

disqusRouter.use(bodyParser.json()); // support json encoded bodies
disqusRouter.use(bodyParser.urlencoded({ extended: true }));

var DISQUS_SECRET = "SppyfjjPZNh4sM68EVGr2d5OGGS12oUvvlxjboWAHv9yiC5JJ3EIMBCcm9bsURTo";
var DISQUS_PUBLIC = "0OmI8FaGlf8KlhbV1J0EGtLHLtgZRVn93wP0OmQniIkti1Tl7LZqjIQWfJj2c687";

disqusRouter.post('/sso', (req, res) => {

  var disqusData = {
    id: req.body.userId,
    username: req.body.username,
    email: req.body.email
  };

  var disqusStr = JSON.stringify(disqusData);
  var timestamp = Math.round(+new Date() / 1000);

  /*
   * Note that `Buffer` is part of node.js
   * For pure Javascript or client-side methods of
   * converting to base64, refer to this link:
   * http://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
   */
  var message = new Buffer(disqusStr).toString('base64');

  /* 
   * CryptoJS is required for hashing (included in dir)
   * https://code.google.com/p/crypto-js/
   */
  var result = CryptoJS.HmacSHA1(message + " " + timestamp, DISQUS_SECRET);
  var hexsig = CryptoJS.enc.Hex.stringify(result);

  res.status(200).json({
    pubKey: DISQUS_PUBLIC,
    auth: message + " " + hexsig + " " + timestamp
  });
});

module.exports = disqusRouter;
