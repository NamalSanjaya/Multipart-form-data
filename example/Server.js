const http = require('http')
const fs = require('fs');
const { bodyParser } = require('../Main');

let home = fs.readFileSync('home.html');

const Server = http.createServer( (req,res)=> {
   if(req.url == 'favicon.ico'){ return }
   if(req.method=='GET'){
        res.writeHead(200 , {'Content-Type':'text/html' });
        res.end(home)
        return
   }
   else if(req.method == "POST"){
       let Index=0,message='';
        req
            .once('readable' , ()=> {
                console.log('Start Reading....');
                buffer = Buffer.alloc(size=3000 ,fill=0 , encoding='utf8')
            })
            .on('data' , (data)=> {

                Index += data.length ; 
                console.log( `Reading....` );
                message += data.toString();
                
            })
            .on('end',()=> {
                //let {document,API} = bodyParser(message);
                //let state = API.saveAll('E:\\Namal_works\\NPM-projects\\bodyparser\\multiPart-formData\\errors');

                //console.log( document , state );

                res.writeHead( 200 , { 'Content-Type':'text/plain' } );
                res.end( message ) ;
                return
        })
   }
   else{
        res.end("Nothing to Say..");
   }
})

Server.listen( 8000 , ()=> console.log('Listening 8000....') );
