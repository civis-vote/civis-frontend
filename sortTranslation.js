// import { HindiLang } from './src/app/shared/models/constants/transalation.json';

const fs = require('fs');
const fileName = './src/app/shared/models/constants/transalation.json'
const data = fs.readFileSync(fileName, 'utf8');
const words = JSON.parse(data);

const sortLang = (a, b) => {
  if ( a.text.toLowerCase() < b.text.toLowerCase() ){
    return -1;
  }
  if (  a.text.toLowerCase() > b.text.toLowerCase() ){
    return 1;
  }
  return 0;
}
fs.writeFile(fileName, JSON.stringify(words.sort(sortLang)), () => {
  console.log('done');
});
