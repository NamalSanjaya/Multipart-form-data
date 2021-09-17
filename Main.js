const dateAPI = require('./src/date');

/*--------------------------------------------------------------------------------------*/

/**
 * @description  get field-data from raw message 
 * @param {String}   formData  - Raw message
 * @returns {object} container - <field:value>
 */

let extractInfo = function(formData){
    let upperBndReg , bottomBndReg , regKey1 , regKey2 , regKey3, regKey4,regVal1 , regVal2;
    let Value , Key , container = {} ;

    upperBndReg  = /-{6}[^-]ebKitFormBoundary.{16}/g;
    bottomBndReg = /--$/g;
    regKey1 = /name=.+/g;
    regKey2 = /\r\n.+/g ;
    regKey3 = /name=/ ;
    regKey4 = /Content-Disposition:.+/g ;
    regVal1 = /\n\n/ ;
    regVal2 = /"/g ;

    try {
        let withoutUpperBnd= formData.replace(upperBndReg,'');
        withoutUpperBnd = withoutUpperBnd.trim();
        let withoutLowerBnd = withoutUpperBnd.replace(bottomBndReg,'');
        let withoutHeader = withoutLowerBnd.replace(regKey4 , '');

        let keySet = withoutLowerBnd.match(regKey1);
        let valueSet = withoutHeader.match(regKey2);
       
        let len = valueSet.length;
    
        for(let ind=0 ;ind<len ; ind++){
            elemKey = keySet[ind] ; 
            elemVal = valueSet[ind].trim();
            
            Key = elemKey.replace(regKey3,'').replace(regVal2,'')
            Value  = elemVal.replace(regVal1,'');
            container[Key] = Value ;
        }
        
    } catch (error) {
        return {}
    }

    return container ;
}

/*----------------------------------------------------------------------------------*/

/**
 * @description To get the type of input field
 * @summary { date:1 , datetime-local:2 , month:3 , week:4 }
 * @param {string} afield 
 * @returns {Number}  - State of the given input field
 */

let guessFieldType = function(aField){

    if( isDateFUNC(aField) ) { 
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

/*-----------------------------------------------------------------------------------*/

let isDateFUNC = function(aField){
    let regDate = /^[0-9]{4}(-[0-9]{2}){2}$/ ;
    let isItDate =   aField.match(regDate);
    
    if(isItDate){ return true ; }
    return false ;
}

/*-----------------------------------------------------------------------------------*/

let isDateTime_LocalFUNC = function(aField){
    let regDate = /^[0-9]{4}(-[0-9]{2}){2}T[0-9]{2}:[0-9]{2}$/ ;

    let isItFntDate = aField.match(regDate);
    if( isItFntDate ){ return true ; }
    return false ;
}

/*-----------------------------------------------------------------------------------*/

let isMonthFUNC = function(aField){
    let regMon = /^[0-9]{4}-[0-9]{2}$/ ;

    let isItMonth = aField.match(regMon);
    if( isItMonth ){ return true ;}
    return false ;   
}

/*-----------------------------------------------------------------------------------*/

let isWeekFUNC = function(aField){
    let regWeek = /^[0-9]{4}-W[0-9]{2}$/ ; 

    let isItWeek = aField.match(regWeek);
    if(isItWeek){ return true ;}
    return false ;
}

/*-----------------------------------------------------------------------------------*/

let isTime = function(aField){
    let regTime = /^[0-9]{2}:[0-9]{2}$/ ;
    let isItTime = aField.match(regTime);
    if(isItTime){ return true ;}
    return false ;
}

/*-----------------------------------------------------------------------------------*/

/**
 * @description  parser the mutipart form data into an object
 * @param {string}   Message - raw message
 * @returns {object} Result  - <field:value> 
 */
let bodyParser = function(Message){
    let Result = {} ;
    let AllFields =  extractInfo( Message );
  
    for(let [aKey,aValue] of Object.entries( AllFields ) ){

        let FieldType = guessFieldType( aValue );

        if(FieldType==0){
            Result[aKey] = aValue ;
        }
        else if(FieldType==1){
            Result[aKey] = dateAPI.date_Seperate(aValue);
        }
        else if( FieldType==2){
            let {date,time} = dateAPI.seperate_datetime(aValue);
            let datePortion = dateAPI.date_Seperate(date);
            let timePortion = dateAPI.time_Seperate(time);
            Result[aKey]    = dateAPI.combineDateTime(datePortion,timePortion);
        }
        else if( FieldType==3 ){
            Result[aKey] = dateAPI.month_Seperate(aValue);
        }
        else if( FieldType==4 ){
            Result[aKey] = dateAPI.week_Seperate(aValue);
        }
        else if( FieldType==5 ){
            Result[aKey]  = dateAPI.time_Seperate(aValue);
        }

    }
    return Result ;
}

/*-----------------------------------------------------------------------------------*/

module.exports = { bodyParser }


