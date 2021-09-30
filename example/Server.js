const http = require('http')
const fs = require('fs');
const { formation } = require('../Main') ;

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
       
        let Form = formation( req );     /* 'formation' do the body parsing and return a event emitter which emit -
                                            when data is available */

        Form.on('data' , (data)=> { 
            Info = data ;
            console.log( data );  // to see how output looks like 
        });
       
        req.on( 'end' , ()=> {

            res.writeHead( 200 , { 'Content-Type': 'application/json'})
            res.end( JSON.stringify(Info) );         // to see the parsed form-data

        })
      
   }

   else{
        res.end("Nothing to Say..");
   }
})

Server.listen( 8000 , ()=> console.log('Listening 8000....') );
