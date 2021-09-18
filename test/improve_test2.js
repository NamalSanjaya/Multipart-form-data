let str =  `The public npm registry is a database of JavaScript packages, 
each comprised of software and metadata` ;

let obj  = { 'data': Buffer.from(str) }
const fs = require('fs');

let xx  = JSON.parse( fs.readFileSync('../temp/rawData.json') );
let out = xx['data'];

console.log( Buffer.from(out.data).toString() );



