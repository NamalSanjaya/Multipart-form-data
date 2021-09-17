

/*------------------------------------------------------------------------------*/

/**
 * 
 * @param {string} pattern <YY:MM:DD>
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
 * @param {string} pattern 
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
 * @param {string} pattern 
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
 * @param {string} pattern 
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
 * @param {string} pattern 
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

module.exports = { date_Seperate , seperate_datetime , time_Seperate , month_Seperate , week_Seperate , combineDateTime}