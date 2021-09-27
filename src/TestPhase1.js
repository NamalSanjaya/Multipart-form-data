
const http = require('http')
const fs = require('fs');
const {stateChanger}  = require('./testPhase4');

let home = fs.readFileSync('Testhome.html');

const Server = http.createServer( (req,res)=> {
   if(req.url == 'favicon.ico'){ return }
   if(req.method=='GET'){
        res.writeHead(200 , {'Content-Type':'text/html' });
        res.end(home)
        return
   }
   else if(req.method == "POST"){
    

     stateChanger(req , { path: './errors' } );

     req.on('end',()=>{
          res.end('AULK NA..');
          console.log('AUlk NA');
     });

   }
   else{
        res.end("Nothing to Say..");
        return
   }
})
Server.listen( 8000 , ()=> console.log('Listening 8000....') );
