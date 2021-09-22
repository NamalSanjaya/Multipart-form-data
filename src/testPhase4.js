const fs = require('fs');
const stream = require('stream')
let state = 1;

let chunkSize=90 , previous = Buffer.alloc(0), NewChnuk, InitDataBuf,Result={}, extraSize = defaultDtSize = 2e6;
let DataContainer = Buffer.alloc(defaultDtSize) , totalLen = 0 , ISFILE = false , IsPrevNull = false ;


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
    previous = Buffer.alloc( chnkLen - from );
    currentChunk.copy(previous,0,from,chnkLen);
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
    let BndObj =  searchFor(chnk,/-{6}[^-]ebKit/) ;
    let _indxBnd;  
    if( BndObj.logic ){
        _indxBnd = BndObj.Index ;
        savePrevious(_indxBnd,chnk);
        initiate_Data_Buffer(chnk, indxSep+4, _indxBnd-2); // since data has been already fetched
        stateChangeto(3); 
        console.log('TO 3');

    }
    else{
        /// start fetching data , changing state to 2
        initiate_Data_Buffer(chnk, indxSep+4, chnk.byteLength);
        speedUp(chnk , 2000);   //speed up if type is a file
        stateChangeto(2);
        console.log('TO 2');
        resetTo();
    }
    return 
}

function seperateFields(chnk,indxSep){
    let _fields = chnk.toString().slice(0,indxSep);
    let name = _fields.replace( /name="/ , '').replace(/(".+|")/ ,'').replace( /\r\n.+/ , '');
    ISFILE = isTypeFile(chnk);
    if( ISFILE ){
        let filename = _fields.replace( /.+filename="/ , '').replace(/"\r\n.+/ ,'');
        let content_type = _fields.replace( /Content-Type: / , '').replace( /.+\r\n/ , '');
        Result[ name ]= { filename , content_type };
        return
    }

    Result[ name ] = '' ;
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
        console.log('UPGRDAED');
        upgradeBuffer();
    }
    chnk.copy( DataContainer, totalLen );
    totalLen += until ;
    return ;
}

function filtered( chnk ,idxBnd){
    let _tepBuf = Buffer.alloc(idxBnd);
    chnk.copy( _tepBuf , 0 , 0 ,idxBnd);  // to remove escape charaters \r\n
    return _tepBuf;

}

function DataBufCombine(){
    let InitLen = InitDataBuf.byteLength ;
    let final = Buffer.alloc( InitLen + totalLen );
    InitDataBuf.copy( final );
    DataContainer.copy( final , InitLen , 0 , totalLen );
    
    return final ;
}

function createFile(){

    NewChnuk = DataBufCombine();
    let path = '../errors/DayTo8.txt';
    let wrt = fs.createWriteStream(path);
    let read = stream.Readable.from(NewChnuk);
    read.pipe( wrt );
    console.log('DONE');

}

function removeData(shift){
    DataContainer = DataContainer.slice(0,totalLen-shift+1)
    return ;
}


function stateONE(chnk){

    NewChnuk = combine2Buffers(previous,chnk);
    let _NameObj =  searchFor(NewChnuk,/name=/) ;
    let _indxName;

    if( _NameObj.logic ){
        _indxName = _NameObj.Index ;

        let _sepObj = searchFor(NewChnuk,/\r\n\r\n/);
        let _indxSep;   

        if( _sepObj.logic ){
            _indxSep = _sepObj.Index ;
            seperateFields(NewChnuk,_indxSep);
            checkBnd(NewChnuk,_indxSep);

        }
        else{
            savePrevious(_indxName,NewChnuk);  // not found \r\n\r\n
        }
    }
    else{
        savePrevious(0,chnk);   // not found name=
    }
}


function stateChanger(request){

    if( state === 1 ){

        request.on('readable' , ()=> {
            let chunk;  
            while ( null !== ( chunk = request.read(chunkSize) ) ) { 
            
               if(state==1){
                    stateONE(chunk);
               }
               else if( state==2 ){
                   console.log('IN --> 2 ');
                    NewChnuk = combine2Buffers(previous,chunk);
                    let _Bnd = searchFor(NewChnuk,/-{6}[^-]ebKit/);
                   
                    if(_Bnd.logic){
                            if(IsPrevNull){
                                if(_Bnd.Index>=3){
                                    let Fchunk = filtered( NewChnuk , _Bnd.Index-2 );
                                    DataAccumute( Fchunk );
                                    stateChangeto(3);
                                }
                            
                            }

                            else{

                                if( _Bnd.Index >= 14 ){
                                    let Fchunk = filtered( NewChnuk , _Bnd.Index - 2);
                                    DataAccumute( Fchunk );
                                    stateChangeto(3);
                                }
                              
                                else{
                                    let offset = 14 - _Bnd.Index  ;
                                    totalLen = totalLen - offset ;
                                    removeData(offset);
                                }

                            }
                    
                    }
                    else{
                        DataAccumute(chunk);
                    }

                    savePrevious( chunk.byteLength - 12 , chunk);
                    IsPrevNull = false ;

               }
               else if( state==3 ){
                   console.log('<3>');
                   
               }

            }

        });

        request.on('close',()=> {
            createFile();
        });

    }

}

module.exports = { stateChanger  }




