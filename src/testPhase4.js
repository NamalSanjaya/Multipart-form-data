const fs = require('fs');
const stream = require('stream');
const EventEmitter = require('events');
let state = 1;

let chunkSize ,  NewChnuk, InitDataBuf,Result, defaultDtSize ;
let DataContainer , totalLen  , ISFILE , IsPrevNull , extraSize , CurName , FndState3 = false , Info = {} , previous = Buffer.alloc(0) ;

// Info is the main return value
// default values 
let defaultOptions = {
    path: __dirname 
}

function combine2Buffers(bf1,bf2){
    let _newBuf = Buffer.alloc(bf1.byteLength + bf2.byteLength);
    bf1.copy(_newBuf);
    bf2.copy(_newBuf , bf1.byteLength );
    return _newBuf ;
}

function Buffer2Str(buf){
    return buf.toString() ;
}

function savePrevious(from,currentChunk){
    let chnkLen = currentChunk.byteLength ;
    previous = Buffer.alloc( chnkLen - from);
    currentChunk.copy(previous,0,from ,chnkLen);
    return 
}

function searchFor(ref,pattern){
    let _st = true ;
    if( Buffer.isBuffer(ref) ){
        ref = Buffer2Str(ref);
    }

    let _indx = ref.search(pattern);
    if(_indx<0){
        _st = false ;
    }

    return { Index:_indx , logic:_st } ;
}

function stateChangeto(to){
    state = to ;
    return 
}

function initiate_Data_Buffer(bufData,from,to){
    InitDataBuf = Buffer.alloc(to-from);
    bufData.copy(InitDataBuf,0,from,to);
    return
}

function isTypeFile(bf){
    if( searchFor(bf,/filename=/).logic ){
        return true;
    }
    return false;
}

function resetTo(){
    previous = Buffer.alloc(0);
    NewChnuk = null ;
    IsPrevNull = true ;
}

function speedUp(currentChunk,sz){
    if( isTypeFile(currentChunk) ){
        chunkSize = sz ;
    }
    return 
}

function checkBnd(chnk,indxSep){
    let BndObj =  searchFor(chnk,/\r\n-{6}[^-]ebKit/)+1 ;
    let _indxBnd;  

    if( BndObj.logic ){
        _indxBnd = BndObj.Index ;
        savePrevious(_indxBnd+2,chnk);
        initiate_Data_Buffer(chnk, indxSep+4, _indxBnd); // since data has been already fetched
        stateChangeto(3); 
        //console.log(`1 - AT ${_indxBnd} FOUND BoundSEP to state 3 `)


    }
    else{
        /// start fetching data , changing state to 2
        initiate_Data_Buffer(chnk, indxSep+4, chnk.byteLength);
        speedUp(chnk , 1000);   //speed up if type is a file
        stateChangeto(2);
        resetTo();
        //console.log('1 - FOUND NOT Boundary SEPeration state 2')
    }
    return 
}

function getCurName(fd){
    let wtout = fd.replace(/name=/);
    let rmFrm = wtout.search(/"/);

    return wtout.slice(0,rmFrm);
}

function getFileInfo(fd){
    let wtoutF = fd.replace(/.*filename="/ , '');
    let indF = wtoutF.search(/"/);

    let filename = wtoutF.slice(0,indF);

    let ind1 = wtoutF.search(/Content-Type: /)+14 ;
    let ind2 = wtoutF.search(/\r\n\r\n/) ;

    let Content_Type = wtoutF.slice(ind1 , ind2 );
    return {filename,Content_Type} ;
}

function seperateFields(chnk,indxSep){
    let _fields = chnk.toString().slice(0,indxSep);
    console.log(_fields)
    CurName = getCurName(_fields);

    ISFILE = isTypeFile(chnk);
    if( ISFILE ){
        Result[ CurName ]= getFileInfo(_fields);
        return
    }

    Result[ CurName ] = '' ;
    return 
}

function isNotSufficient( until ){
    if( until + totalLen > defaultDtSize){
        return true ;
    }
    return false ;
}

function upgradeBuffer(){
    defaultDtSize += extraSize ;
    let tempBuf = Buffer.alloc( defaultDtSize  );
    DataContainer.copy( tempBuf );
    DataContainer = tempBuf ;
    tempBuf = null ;
    return 
}

function DataAccumute(chnk){
    let until = chnk.byteLength;
    if( isNotSufficient(until) ){
        upgradeBuffer();
    }
    chnk.copy( DataContainer, totalLen );
    totalLen += until ;
    return ;
}

function filtered( chnk , idxBnd){
    let _tepBuf = Buffer.alloc(idxBnd);
    chnk.copy( _tepBuf , 0 ,idxBnd);  // to remove escape charaters \r\n
    return _tepBuf;

}

function DataBufCombine(){
    let InitLen = InitDataBuf.byteLength ;
    let final = Buffer.alloc( InitLen + totalLen);
    InitDataBuf.copy( final );
    DataContainer.copy( final , InitLen , 0 , totalLen );
    
    return final ;
}

function pathCreate(dir){
    if(Result){
        return dir.concat( '/' , Result[CurName].filename )
    }
    return '';
}


function chooseParameters( opt ,key ){
    if(opt.key){
        return opt.key ;
    }
    return defaultOptions[key]
}

function createFile(optns){

    NewChnuk = DataBufCombine();
    let dirTo = chooseParameters( optns , 'path' );
    let path = pathCreate(dirTo);
    let wrt = fs.createWriteStream(path);
    let read = stream.Readable.from(NewChnuk);
    read.pipe( wrt );
    

}

function removeData(shift){
    DataContainer = DataContainer.slice(0,totalLen-shift+1)
    return ;
}

function resetBeforeStart(){
    chunkSize= 80 , NewChnuk = null, InitDataBuf = null, Result={}, defaultDtSize = 8e4;
    DataContainer = Buffer.alloc(defaultDtSize) , totalLen = 0 , ISFILE = false , IsPrevNull = false , extraSize = 8e3 , CurName=null;

}


function stateONE(chnk){

    NewChnuk = combine2Buffers(previous,chnk);
    let _NameObj =  searchFor(NewChnuk,/name=/) ;
    let _indxName;
    //console.log( NewChnuk.toString() )
    if( _NameObj.logic ){
        _indxName = _NameObj.Index ;
        //console.log('1 - FOUND name=')
        let _sepObj = searchFor(NewChnuk,/\r\n\r\n/);
        let _indxSep;   

        if( _sepObj.logic ){
            //console.log('1 - FOUND dataseP')
            _indxSep = _sepObj.Index ;
            seperateFields(NewChnuk,_indxSep);
            checkBnd(NewChnuk,_indxSep);

        }
        else{
            //console.log('1 - FOUND NOT data SEP')
            savePrevious(_indxName,NewChnuk);  // not found \r\n\r\n
        }
    }
    else{
        //console.log('2-NOt found name=')
        savePrevious(0,chnk);   // not found name=
    }
    //console.log('================================================================');
    return 
}

function stateTwo(chnk){
    NewChnuk = combine2Buffers(previous,chnk);
    let _Bnd = searchFor(NewChnuk,/-{6}[^-]ebKit/);
    
    if(_Bnd.logic){
            if(IsPrevNull){
                if(_Bnd.Index>=3){
                    let Fchunk = filtered( chnk , _Bnd.Index -2 );
                    DataAccumute( Fchunk );
                }
            
            }

            else{
                if( _Bnd.Index >= 14 ){
                    let Fchunk = filtered( chnk ,  _Bnd.Index - 14 );
                    DataAccumute( Fchunk );
                }
                
                else{
                    let offset = 14 - _Bnd.Index  ;
                    totalLen = totalLen - offset ;
                    removeData(offset);
                }
            }
            stateChangeto(3);
            savePrevious(0,chnk);
            return
    }
    else{
        DataAccumute(chnk);
    }

    savePrevious( chnk.byteLength - 12 , chnk);
    IsPrevNull = false ;
    return 

}

class finilize extends EventEmitter{

    constructor(){
        super();
    }

    getFinalData(){
        if(ISFILE){
            //console.log('A File..')
        }
        else{
            Result[CurName] = InitDataBuf.toString();
            Object.assign( Info , Result );
            //console.log( Info );
        }

    }
}


function stateChanger(request , options ){

       // TO begin 
        resetBeforeStart();
        const finalTracker = new finilize();

        request.on('readable' , ()=> { 
            let chunk;
            
            while ( null !== ( chunk = request.read(chunkSize) ) ) { 


                if( state == 3 ){
                    //console.log('<3>');
    
                    if(ISFILE){
                        createFile(options);
                    }
                    else{
                        Result[CurName] = InitDataBuf.toString();
                    }

                    Object.assign( Info , Result );
                    //console.log( Info , Result );
                    stateChangeto(1) ; 
                    savePrevious( 0 , chunk );
                    resetBeforeStart() ;
                    FndState3 = true;

                }
                else if(state==1){
                    stateONE(chunk,request);
                    FndState3 = false;
                   
                }
                else if( state==2 ){
                    stateTwo(chunk,request);
                    FndState3 = false ;
                }
            }

        });


        finalTracker.on('event' , ()=> {
            finalTracker.getFinalData();
            //console.log('U got the final data also ..');
        })


        request.on('close',()=> {
            //console.log('FINEEEEE...');
            if(!FndState3){
                finalTracker.emit('event');
            }


        });
}

module.exports = { stateChanger  }




