

/*------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <YY-MM-DD>
 * @returns {object} { date , year , month , day } 
 */

let date_Seperate= function(pattern){
  
    let regY , regM , regD ;
    let year , month , day ;

    regY = /^[0-9]{4}/ ;
    regM = /-(0[1-9]|1[0-2])-/ ;
    regD = /-(0[1-9]|[1-2][0-9]|3[0-1])$/ ;

    try {

        year = pattern.match(regY)[0]
        month = pattern.match(regM)[0].replace(/-/g , '')
        day = pattern.match(regD)[0].replace(/-/ , '')
        
    } catch (error) {
        return {}
    }
    let date = pattern
    let dateInfo = {date,year,month,day};
    return dateInfo ;
}

/* -------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <YY-MM-DD T Hr:Min>
 * @returns {object} { date , time }
 */

let seperate_datetime = function(pattern){
   
    let DateTime , date , time ;
    try {
        let DT_Arr = pattern.split('T')
        date = DT_Arr[0] ; 
        time = DT_Arr[1] ;
        if( date.length !=10){ date = null }
        if( time.length !=5 ){ time = null }
        
    } catch (error) {
        return {} 
    }

    DateTime = {date,time}
    return DateTime ;
}

/*-----------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <Hr:Min>
 * @returns {object} { hour , minute }
 */
let time_Seperate = function(pattern){

    let regHour , regMinute , hour,minute;
    regHour = /([0-1][0-9]|2[0-3])/ ;
    regMinute = /[0-5][0-9]$/ ;

    try {
        hour = pattern.match(regHour)[0];
        minute = pattern.match(regMinute)[0];
        
    } catch (error) {
        return {}
    }
    let time = pattern ;
    return { time, hour,minute };
}

/*--------------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <YY-MM>
 * @returns {object}  {date,year,month}
 */

let month_Seperate = function(pattern){

    let regY , regM ;
    regY = /^[0-9]{4}/ ;
    regM = /-(0[1-9]|1[0-2])$/ ;

    try {

        year = pattern.match(regY)[0]
        month = pattern.match(regM)[0].replace(/-/g , '')
       
    } catch (error) {
        return {}
    }

    let date = pattern
    let dateInfo = {date,year,month};

    return dateInfo ;

}

/*--------------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <YY-WW>
 * @returns {object} {year,week}
 */

let week_Seperate = function(pattern){
    let regYear , regWeek,year ;
    regYear = /^[0-9]{4}/ ;
    regWeek = /W(0[^0]|[1-4][0-9]|5[0-3])$/;

    try {
        year = pattern.match(regYear)[0] ;
        week = (pattern.match(regWeek)[0]).replace(/W/ , ''); 
        
    } catch (error) {
        return {}
    }

    return {year,week}

}

/*---------------------------------------------------------------------------------------*/

let combineDateTime = function(dateObj , timeObj){

    return Object.assign(dateObj,timeObj);
}

/*-----------------------------------------------------------------------------------*/

let isDateFUNC =  function(aField){
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


module.exports = { date_Seperate , seperate_datetime , time_Seperate , month_Seperate , week_Seperate , combineDateTime ,
    isDateFUNC, isDateTime_LocalFUNC, isMonthFUNC, isWeekFUNC, isTime }

