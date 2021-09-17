const http = require('http')
const qs = require('querystring')
const fs = require('fs')
const { bodyParser } = require('../src/Main');

let home = fs.readFileSync('home.html');

const Server = http.createServer( (req,res)=> {
   if(req.url == 'favicon.ico'){ return }
   if(req.method=='GET'){
        res.writeHead(200 , {'Content-Type':'text/html' });
        res.end(home)
        return
   }
   else if(req.method == "POST"){
       let Info =``;
        req
            .once('readable' , ()=> {
                console.log('Start Reading....');
            })
            .on('data' , (data)=> {
                console.log( `Reading....` );
                Info += data.toString();
            })
            .on('end',()=> {
                let pharsedInfo = bodyParser(Info);
                res.writeHead( 200 , { 'Content-Type':'application/json' } );
                res.end( JSON.stringify(pharsedInfo) ) 
                return
        })
   }
   else{
        res.end("Nothing to Say..")
   }
})

Server.listen( 8000 , ()=> console.log('Listening 8000....') )