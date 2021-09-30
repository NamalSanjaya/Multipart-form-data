
const dateAPI = require('./date');


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

/*----------------------------------------------------------------------------------*/ 



/**
 * @description To get the type of input field
 * @summary { date:1 , datetime-local:2 , month:3 , week:4 }
 * @param {string} afield 
 * @returns {Number}  - State of the given input field
 */

function whatFieldType(aField , aFile){

    if( aFile ){
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



function parseValue( FieldType , aValue ){
    let parsed = '';
    
    if(FieldType==0){
        parsed = aValue ;
    }
    else if(FieldType==1){
        parsed = dateAPI.date_Seperate(aValue);
    }
    else if( FieldType==2){

        let {date,time} = dateAPI.seperate_datetime(aValue);
        let datePortion = dateAPI.date_Seperate(date);
        let timePortion = dateAPI.time_Seperate(time);
        parsed    = dateAPI.combineDateTime(datePortion,timePortion);

    }
    else if( FieldType==3 ){
        parsed = dateAPI.month_Seperate(aValue);
    }
    else if( FieldType==4 ){
        parsed = dateAPI.week_Seperate(aValue);
    }
    else if( FieldType==5 ){
        parsed  = dateAPI.time_Seperate(aValue);
    }
    else if( FieldType==6 ){
        // for file type 
       parsed = '' ;
    }

    return parsed ;

}


module.exports = { whatFieldType , parseValue }
