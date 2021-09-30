
const emitter = require('events');
const { whatFieldType , parseValue }  =  require( './FieldParse' )

// even emitter class
class formEmitter extends emitter{   }



// global varibles
let previous, NewChunk , Result , sessionResult , InitData , IsAFile, Mode , chunkSize , currentSize , extraSize , ReadData;


/**
 * @description reset to default values
 */

function resetAll(){

    previous = Buffer.alloc(0) , NewChunk = null , InitData = Buffer.alloc(0) , Mode = 1 ;
    Result = {} , sessionResult  = {} , IsAFile = false , chunkSize = 80 , currentSize = 0 , extraSize = 0 , Total = 0 ;

}


/**
 * @description when changing state : Header Reading -> Header Reading
 */
function reset_H2H(){
    InitData = Buffer.alloc(0);
    IsAFile = false ;
}


/**
 *  @description when changing state : Data Reading -> Header Reading
 */
function reset_R2H(){

    NewChunk = null , InitData = Buffer.alloc(0) , Mode = 1 ;
    sessionResult  = {} , IsAFile = false , chunkSize = 80 , currentSize = 0 , extraSize = 0 , Total = 0 ;

    return
}


/**
 * 
 * @param {Buffer} bf1 
 * @param {Buffer} bf2 
 * @returns {Buffer} combination of two buffers
 */

function combine2Buffers(bf1,bf2){
    let _newBuf = Buffer.alloc( bf1.byteLength + bf2.byteLength );
    bf1.copy(_newBuf);
    bf2.copy(_newBuf , bf1.byteLength );
    return _newBuf ;
}

 /**
  * 
  * @param {Buffer} buf 
  * @returns {string} convert into a string
  */

function Buffer2Str(buf){
    return buf.toString() ;
}


/**
 * 
 * @param {Number} from 
 * @param {Buffer} currentChunk 
 * @description save the previous processed data chunk in buffer called "Previous" 
 */

function savePrevious(from , currentChunk){
    // setting default values
    from = from || 0 ;

    let chnkLen = currentChunk.length ;
    previous    = Buffer.alloc( chnkLen - from );
    currentChunk.copy(previous,0,from ,chnkLen);

    return 
}

/**
 * 
 * @param {Number} val 
 * @description reset the "Previous"
 */
function resetPrevious(val){
    if(val==1){
        previous = Buffer.alloc( 1 , '\r');
    }
    else if( val==2){
        previous = Buffer.alloc(2 , '\r\n')
    }
    else{
        previous = Buffer.alloc(0) ;
    }
    return ;
}



/**
 * 
 * @param {Buffer} ref 
 * @param { RegExp } pattern 
 * @returns { boolean }  check the existence 
 */
function searchFor(ref,pattern){

    if( Buffer2Str(ref).search(pattern) < 0 ){

        return false;
    }

    return true;
}


/**
 * 
 * @param { Buffer } ref 
 * @param { RegExp } pattern  
 * @returns { Number } Index of the searched pattern
 */

function searchIndex(ref,pattern){
    return  Buffer2Str(ref).search(pattern);
}


/**
 * 
 * @param { Buffer } bufData 
 * @param { Number } from 
 * @param { Number } to 
 * @description initiate a buffer to store data in header reading state
 */

function initiate_Data_Buffer(bufData,from,to){

    if( from>= to){
        return ;
    }

    InitData = Buffer.alloc(to-from);
    bufData.copy(InitData,0,from,to);

    return
}


/**
 * 
 * @param { Number } Line 
 * @param { Number } Bnd 
 * @returns { boolean }
 * @description check if there is a data in header reading state
 */

function noData(Line,Bnd){
    if( Line+4 >= Bnd ){
        return true;
    }
    return false ;
}

/**
 * @returns { boolean }
 * @description check whether the current data is belong to a file type
 */

function isFile(){

    if( searchFor( NewChunk , /filename=/ ) ){
        return true;
    }

    return false ;
}

/**
 * @param { Number } sizeTo 
 * @description change the reading chunk size from internal buffer
 */

function changeChunkSize(sizeTo){
    chunkSize = sizeTo ;
}


/**
 * 
 * @param { string } pattern 
 * @returns { string } 
 * @description set 13 long string
 */

function INTF_BND_Filter(pattern){
    let from;

    if( pattern ){
        if( pattern.length >= 13 ){

            from = pattern.length - 13 ;
        }
        else{
            from = 0;
        }

        pattern = pattern.slice( from ).toString();
        let lstINd = pattern.lastIndexOf('\r');

        pattern = pattern.slice( lstINd );

        return pattern.padStart(13 ,'A');
    }
 
    return '';
 
}


/**
 * 
 * @param { Buffer } pattern 
 * @returns { Number } 
 * @description find the length of unnecessary part to remove
 */

function BndFilter(pattern){

    let buf = Buffer.from( '\r\n------WebKi' );
    let cnt = 0;
    let st = false;

    pattern = INTF_BND_Filter(pattern) ;

    for( let i = 0; i < 13 ; i++ ){
        //console.log( pattern.charCodeAt(i) , buf[cnt] )
        if( pattern.charCodeAt(i) == buf[cnt] ){
            cnt++  ;
            
            if( cnt == 4){
                st = true;
            }

            if( i == 12){
                return cnt;
            }

        }

        else if( st ){
            return 0;
        }

        else{
          
            cnt = 0;
        }
    }

    return 0;
}


/* ==========================   Extract fields =================================== */

function getHeader( sepName_ , sepLine_ ){
    return Buffer2Str( NewChunk.slice( sepName_ , sepLine_ ) );

}


function getTypeName( exp ){
        return exp.replace( /name="/ , '' ).replace( /"/ , '' ).trim();

}

function getFileName( exp ){
    return exp.replace( / filename="/ , '' ).replace(/"/ , '').trim() ;
}

function getContentType( exp ){
    return exp.replace(/Content-Type: / , '').trim() ;
}


/* ===========================   Extract fields - END  ======================================== */


/**
 * 
 * @param { Buffer } chnk 
 * @returns { Object } { logic , sepName , sepLine }
 * 
 */

function Hd_filter_L1(chnk){
   
    if( searchFor(chnk,/name=/ ) ){

        let sepName = searchIndex(chnk,/name=/);

        if( searchFor(chnk,/\r\n\r\n/) ){

            let sepLine = searchIndex(chnk,/\r\n\r\n/);
            return { logic:true , sepName , sepLine } ;
        }


        savePrevious(sepName,chnk);
        return { logic:false } ;

    }

    savePrevious(0,chnk);
    return { logic:false } ;
    
}


/**
 * 
 * @param { Object } resL1  { logic , sepName , sepLine }
 * @returns { Object }  { logic , sepName , sepLine , sepBnd }
 */

function Hd_filter_L2( resL1 ){

    let sepBnd = null;
    if( searchFor(NewChunk.slice( resL1.sepName ) ,/-{6}[^-]ebKit/) ){
        sepBnd = searchIndex( NewChunk.slice( resL1.sepName ) , /-{6}[^-]ebKit/) + resL1.sepName;

        if( noData( resL1.sepLine , sepBnd ) ){
            resetPrevious(0);
        }

        else{

            initiate_Data_Buffer( NewChunk , resL1.sepLine+4 , sepBnd - 2);
            savePrevious( sepBnd , NewChunk );

        }

    }

    else{
        let _BadIndx = BndFilter(NewChunk);
        let NLen = NewChunk.length - _BadIndx;

        if( _BadIndx > 2 ){
            sepBnd =NLen ;
        }
        else{

            sepBnd = null ;
        }

        if( noData( resL1.sepLine , NLen ) ){

            sepBnd = 1              
            resetPrevious(0);
            
        }

        else{
            
            initiate_Data_Buffer( NewChunk , resL1.sepLine + 4 , NLen );
            resetPrevious(_BadIndx);
        }

    }

    Object.assign( resL1 , { sepBnd } ) ;

    return resL1 ;

}

/**
 * 
 * @param { Number } sepName_ 
 * @param { Number } sepLine_ 
 * @returns { Object } { name , filename , content_type }
 */


function FieldExtract( sepName_ , sepLine_ ){

    let Header = getHeader( sepName_ , sepLine_ );
    let HeaderArr = Header.split(";");
    let name = getTypeName( HeaderArr[0] );
    
    IsAFile = isFile();

    if( IsAFile ){
        let fileSpt = HeaderArr[1].split("\r\n");

        let filename     = getFileName( fileSpt[0] );
        let content_type = getContentType( fileSpt[1] );

        return { name , filename , content_type } ;

    }
    
    return { name } ;

}


function getInitData(){

    return Buffer2Str( InitData );

}


function changeMode( modeTo ){
    Mode = modeTo ;
}


/**
 * 
 * @description update the global "Result" 
 */

function ResultUpdate(){

    if(!IsAFile){
        let aVal = getInitData();
        let type = whatFieldType( aVal , IsAFile );
    
        Result[ sessionResult.name ] = parseValue( type , aVal );

    }

    sessionResult = {} ;

    return 
}


/**
 *  
 * @param { Number } tomode  to which mode next 
 * @param { Number } sz      data stored buffer size
 * @param { Number } eSz     update size 
 * @param { Number } readSz  date store size
 */

function setToRead(tomode,sz,eSz , readSz){

    changeMode(tomode);
    currentSize = sz ;
    extraSize   = eSz ;
    changeChunkSize( readSz );
    ReadData = Buffer.alloc( currentSize );

    return 


}

/**
 * 
 * @param { Buffer } chunk 
 * @desciption  Header reading | change Modes
 */

function HeaderLoop(chunk){

    let outFL1 = Hd_filter_L1(chunk);
    if( outFL1.logic ){

        let outFL2 = Hd_filter_L2(outFL1);
        sessionResult = FieldExtract( outFL2.sepName , outFL2.sepLine );

        if( outFL2.sepBnd ){

            ResultUpdate();
            reset_H2H();
            return 

        }

        if( IsAFile ){
            // file reading
            setToRead( 2,6e4,1e4,800 ) ;

        }
        else{
            // data reading
            setToRead( 3 , 100 , 80 , 40 ) ;
            
        }

        return 

    }

    return 

}

/* ===========================  store data in "Reading data mode"  ======================== ====  */

function upgradeSize(){

    currentSize += extraSize ;
    let temp = Buffer.alloc( currentSize );

    ReadData.copy( temp );

    ReadData = temp;
    temp = null ;

    return 

}


function isNotSufficient( chnkLen ){

    if( currentSize < Total + chnkLen){
        return true;
    }
    return false ;

}

/**
 * 
 * @param { Buffer } chnk 
 * @description store data and update the total data amount
 */

function storeData( chnk ){
    // to both update and increase the Total
    let Len,frm , preLen =  previous.length;

    Len = chnk.length - preLen ;
    frm = preLen;

    if( isNotSufficient( Len ) ){
        upgradeSize();
    }
    
    chnk.copy( ReadData , Total , frm );
    Total += Len ;
    return 
}

/**
 * @description combine both data buffers to get final data 
 */
function combineData(){

    let _ReadDt = ReadData.slice(0,Total);
    InitData = combine2Buffers(InitData , _ReadDt );

}


/**
 * 
 * @param { Buffer } chnk 
 * @description store data after found the boundary
 */

function filterNstore(chnk){

    let _Bnd = searchIndex( chnk , /\r\n-{6}[^-]ebKit/ );
    let Ln = previous.length;

    if( Ln < 14){

        let freshChunk1 = chnk.slice( 0 , _Bnd + Ln );
        storeData(freshChunk1); 

    }

    else if( _Bnd<14){

        Total = Total - (14 - _Bnd);
        ReadData =  ReadData.slice(0, Total);
    }

    else{
       
        let freshChunk2 = chnk.slice(0,_Bnd);
        storeData(freshChunk2);
    }

    savePrevious( _Bnd+2 , chnk );

    return
}

/**
 * 
 * @param { Buffer } chnk 
 * @description remaining data reading in header reading mode
 */

function nonStatic_ReadLoop( chnk ){

    if( searchFor(chnk , /\r\n-{6}[^-]ebKit/ ) ){

        filterNstore(chnk);
        combineData();     /// combine All data and store it in InitData variable
        ResultUpdate();
        reset_R2H();

        return 
    }

    storeData(chnk);
    savePrevious( chnk.length-14 , chnk );

    return 
    
}


/* =============================  Forming the fields ( Main function ) =============================== */


function formation( request ){
    
    let getForm = new formEmitter();
    resetAll() ;
    request.on( 'readable' , () => {
        let chunk;

        while( null !== ( chunk = request.read(chunkSize) ) ) {
    
            NewChunk = combine2Buffers(previous,chunk);

            if( Mode == 1){
                HeaderLoop( NewChunk );
            }

            else if( Mode == 2){
                // 'ReadingLoop' in file reading mode ;
                throw new Error('Still not developed for static files : << Unauthorized access attempt denied >>')
            }

            else if( Mode == 3){

                // header remaining 'data-Reading' ;
                nonStatic_ReadLoop(NewChunk);

            }
        }

    });

    request.on('error' , ( err ) => {
        console.error( err )
    })

    request.on( 'end' , ()=> {

        getForm.emit('data' , Result );
        resetAll() ;
        getForm.removeAllListeners('data');

    });

    return getForm ;

}


module.exports = {  formation }
