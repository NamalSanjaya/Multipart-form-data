const http = require('http')
const fs = require('fs');
const { getForm , formation } = require('../src/FormOut') ;

let home = fs.readFileSync('home.html');

const Server = http.createServer( (req,res)=> {
   if(req.url == 'favicon.ico'){ return }

   if(req.method=='GET'){
        res.writeHead(200 , {'Content-Type':'text/html' });
        res.end(home)
        return
   }

   else if(req.method == "POST"){
        let Info = {} ;
       
        formation( req );

        getForm.on('data' , (obj)=> {
            Info = obj ;
            console.log(obj);
        })
       
        req.on( 'end' , ()=> {
            res.writeHead( 200 , { 'Content-Type': 'application/json'})
            res.end( JSON.stringify(Info) );
            // res.end('Bye');
        })

      
   }

   else{
        res.end("Nothing to Say..");
   }
})

Server.listen( 8000 , ()=> console.log('Listening 8000....') );
