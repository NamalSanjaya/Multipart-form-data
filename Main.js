const dateAPI = require('./src/date');
const fs = require('fs');
const {FileHandler,readData,dbPath}  = require('./src/file-handler')
const {isDateFUNC,isDateTime_LocalFUNC,isMonthFUNC,isWeekFUNC,isTime} = dateAPI ;

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

/*-----------------------------------*/

let globalFile ;                         //  Info about files {object} <HTMLTAG name : filename>

/*------------------------------------------------------------- */
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

/*--------------------------------------------------------------------------------------*/


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
        fieldArray.shift();

        fieldArray.forEach((element)=> {
            aKeyBefore = element.match(aBreg)[0];
            aFileBefore = aKeyBefore.match(aFBreg);
            aValue = element.replace( aVreg1 , '').replace( aVreg2 , '').trim();
                if(aFileBefore){
                    sepFile = forFileSep(aKeyBefore);
                    forJSONfile[ sepFile[0] ]  = sepFile[1] ; 
                    aKey   = sepFile[0] ; 
                    aValue = Buffer.from( aValue );
                }
                else{
                    aKey = aKeyBefore.replace( aKreg ,'').replace(colreg , '').trim();
                }

                rawJSONdata[aKey] = aValue;

        })
        let toWrite = JSON.stringify({rawJSONdata,forJSONfile} );
        fs.writeFileSync( dbPath , toWrite);

        return 
            
    } catch (error) {
        throw new Error('Error! : around extractJSON() function!');
    }

}

/**
 * @description To get the type of input field
 * @summary { date:1 , datetime-local:2 , month:3 , week:4 }
 * @param {string} afield 
 * @returns {Number}  - State of the given input field
 */

let guessFieldType = function(aField , aKey){
    aKey = aKey || null ;

    if( isAFile(aKey) ){
        return 6;
    }
    else if( isDateFUNC(aField) ) { 
        return 1 ; 
    }
    else if( isDateTime_LocalFUNC(aField) ) { 
        return 2 ; 
    }
    else if( isMonthFUNC(aField) ){
        return 3 ;
    }
    else if( isWeekFUNC(aField ) ){
        return 4 ;
    }
    else if( isTime(aField) ){
        return 5 ;
    }
    return 0 ;
}

/*---------------------------------------------------------------------------------*/

let isAFile = function(aKEY){
    if(aKEY){
        if( globalFile.hasOwnProperty(aKEY) ){
            return true ;
        }
        return false ;
    }
    return false;
}

/*--------------------------------------------------------------------------------*/

let initizeAPI = function(){
    return new FileHandler();
}

/*----------------------------------------------------------------------------------*/

/**
 * @description  parser the mutipart form data into an object
 * @param {string}   Message - raw message
 * @returns {object}   { document , API } 
 * document <field:value> | API - for file saving
 */
let bodyParser = function(Message){
    let document = {} , cnt = 0 , API = null;
    extractJSON(Message);

    let { rawJSONdata ,  forJSONfile } = readData() ;
    globalFile = forJSONfile ;

    for(let [aKey,aValue] of Object.entries(rawJSONdata) ){

        let FieldType = guessFieldType( aValue , aKey );

        if(FieldType==0){
            document[aKey] = aValue ;
        }
        else if(FieldType==1){
            document[aKey] = dateAPI.date_Seperate(aValue);
        }
        else if( FieldType==2){
            let {date,time} = dateAPI.seperate_datetime(aValue);
            let datePortion = dateAPI.date_Seperate(date);
            let timePortion = dateAPI.time_Seperate(time);
            document[aKey]    = dateAPI.combineDateTime(datePortion,timePortion);
        }
        else if( FieldType==3 ){
            document[aKey] = dateAPI.month_Seperate(aValue);
        }
        else if( FieldType==4 ){
            document[aKey] = dateAPI.week_Seperate(aValue);
        }
        else if( FieldType==5 ){
            document[aKey]  = dateAPI.time_Seperate(aValue);
        }
        else if( FieldType==6 ){
           document[aKey] = forJSONfile[aKey] ;
           cnt++ ;
        }

    }

    if(cnt>0){ API = initizeAPI( ); }

    return { document , API };
}

/*-----------------------------------------------------------------------------------*/

module.exports = { bodyParser }


