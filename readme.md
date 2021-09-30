# __simple-multipart-formdata__

#### __Installation :__

```
npm install simple-multipart-formdata

```


---

### <span style="color:lightgreen">- Simple API to parse multipart-formdata into a readable object.</span>

### <span style="color:lightgreen">- Only requires HTTP request as an input which then return an event emitter. This will emit data event when form-data is ready. You need to assign an event listener to consume data which is coming as a readable object. </span>

__Note :__ It will not work with static types such as files. This works really well with all other types.


### __Example__
```javascript

const { formation } = require('simple-multipart-formdata');

let    Form         =  formation( req ); 

Form.on( 'data' , (data)=> {

    // do something
    // data is readable object, containing parsed request body data
})

```
### __Explanation__

<span style="color:pink">formation( req ) </span><span style="color:lightblue"> get the HTTP request stream and return an event emitter which is fired when multipart-form-data has properly parsed.**This is the main API of this module.** </span>

<span style="color:pink">Form</span> <span style="color:lightblue"> ( you can name this as you want ) is stored the return value which is an Event emitter</span>
 

## __API__

```
formation( [stream] )
```
<span style="color:lightgreen">return : emitter </span>

### __Full Example :__


HTTP Server which is handling incoming requests.

![alt js](./materials/codeEx.png)

Here is the relavent html code.

![alt html](./materials/htmlEx.png)


Here is the Output looks like.

![alt result](materials/resultsEx.png)

NICE ahh ............  :smiley::smiley:

following table shows the field(key) and data format of return object

|      type                        | data format          |
|----------------------------------|----------------------|
|checkbox , text , color , email   | text/plain           |
|number , password , radio , range | text/plain           |
|search , tel , url                | text/plain           |
|date                              |{ date,YY,MM,DD }     |
|datetime-local                    |{ datetime,YY,MM,DD,HR,MIN }|
|month                             |{ date,YY,MM }        |
|week                              |{ date,YY,WW }        |
|time                              |{ time,HR,MIN }       |   
 
Here ;

YY -> year ,  MM -> month , WW -> week ,  DD -> day  , HR -> hour , MIN -> minute 
