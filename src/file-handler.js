const fs = require('fs')


/*----------------------------*/
//variable relavant to file save

let dbPath = '../temp/rawData.json' ;     // default storage for intermediate data
/*----------------------------------------------------------------------------------*/

// to read the data in JSON file
let readData = function(){

    let fromRead = fs.readFileSync(dbPath) ;
    
    return JSON.parse( (fromRead.toString()) ) ;
   
}

/*----------------------------------------------------------------------------------*/



class FileHandler{
    constructor(){
        this.fileArray = readData();
    }

    saveAll(dir){
        dir = dir || null ; 
        let fileCnt = 0;
        try{
            let path,filename;
            let file = this.fileArray["forJSONfile"] ;
            let data = this.fileArray[ "rawJSONdata" ] ;

            for( let eachFile in file){
                filename = file[eachFile];
                if(dir){ 
                    dir = dir.replace(/\/$/ , '' )
                    path = dir.concat( '/' ,filename)
                }
                else{
                    path = filename ;
                }
                fs.writeFileSync( path , Buffer.from( data[eachFile]["data"] ).toString() );
                fileCnt++;
            }
        }
        catch(error){
            /// leave for error logging
        }

        fs.rmSync(dbPath);
        return fileCnt;
    }

}





module.exports = {FileHandler,readData , dbPath}