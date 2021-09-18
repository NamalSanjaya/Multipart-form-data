const fs = require('fs');

let Info = `------WebKitFormBoundary3Gbd2wTfFxixrzkf
Content-Disposition: form-data; name="MYname"

sanjaya
------WebKitFormBoundary3Gbd2wTfFxixrzkf
Content-Disposition: form-data; name="MyFile"; filename="text1.txt"
Content-Type: text/plain

To help others find your packages on npm 
and have a good experience using your code.
------WebKitFormBoundary3Gbd2wTfFxixrzkf
Content-Disposition: form-data; name="MYtime"

2021-09-28
------WebKitFormBoundary3Gbd2wTfFxixrzkf
Content-Disposition: form-data; name="submission"

Submit
------WebKitFormBoundary3Gbd2wTfFxixrzkf--` ;


let isAFile = function(exp){
    let regFile = /filename=.+/g ;
    let regFileName = /filename=/ ;
    let regcol  = /"/ ;
    let checkFileField = exp.match( regFile );
    if( checkFileField ){
        return checkFileField.replace(regFileName,'').replace(regcol,'');
    }
    return 
}


let upperBndReg , bottomBndReg , aBreg , aFBreg , aVreg1 , aVreg2 , aKreg , filereg;

upperBndReg  = /-{6}[^-]ebKitFormBoundary.{16}/g;
bottomBndReg = /--$/g ;
aBreg        = /name=.+/g ;
aFBreg       = /filename=.+/g;
aVreg1       =  /Content-Disposition:.+/g;
aVreg2       = /Content-Type:.+/g ; 
aKreg        = /name=/g ;
colreg       = /"/g ;
filereg      = /filename=/g;
/**
 * 
 * @param {string} exp  <-- akeyBefore
 */

let forFileSep = function(exp){
    let toArray = exp.split(';');
    let forKey = toArray[0] , forValue = toArray[1];
    let fileKey = forKey.replace(aKreg ,'').replace(colreg , '').trim() ; 
    let fileValue = forValue.replace( filereg ,'').replace(colreg,'').trim();

    return [fileKey,fileValue] ;
}

/**
 * @description  store data in a JSON file 
 * @param {string} msgBody  raw multipart-form-data
 * 
 */

let extractJSON = function( msgBody){

    let aKeyBefore , aValue ,aFileBefore , aKey , sepFile;
    let rawJSONdata = {} , forJSONfile = {} ;

    try {
        let withoutBottom = msgBody.replace( bottomBndReg , '');
        let fieldArray    = withoutBottom.split( upperBndReg );

        // remover unnecessay elements
        fieldArray.pop(); 
        fieldArray.shift() ;

        fieldArray.forEach((element)=> {
            aKeyBefore = element.match(aBreg)[0];
            aFileBefore = aKeyBefore.match(aFBreg);
            aValue = element.replace( aVreg1 , '').replace( aVreg2 , '').trim();

            if(aFileBefore){
                    sepFile = forFileSep(aKeyBefore);
                    forJSONfile[ sepFile[0] ]  = sepFile[1] ; 
                    aKey   = sepFile[0] ; 
                }
                else{
                    aKey = aKeyBefore.replace( aKreg ,'').replace(colreg , '').trim();
                }

                rawJSONdata[aKey] = aValue;

        })

        let toWrite = JSON.stringify({rawJSONdata,forJSONfile} );

        let Wstream = fs.createWriteStream('../temp/rawData.json');
        Wstream.write(toWrite);
        Wstream.end();
            
    } catch (error) {
        throw new Error('Error! : around extractJSON() function!');
    }

}


extractJSON(Info)