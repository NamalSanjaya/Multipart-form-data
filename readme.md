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

```javascript
      else if(req.method == "POST"){

        let Info = {} ;
       
        let Form = formation( req );     /* 'formation' do the body parsing and return a event emitter which emit -
                                            when data is available */

        Form.on('data' , (data)=> { 
            Info = data ;
            console.log( data );  // to see how output looks like 
        });
       
        req.on( 'end' , ()=> {

            res.writeHead( 200 , { 'Content-Type': 'application/json'})
            res.end( JSON.stringify(Info) );         // to see the parsed form-data

        })
      
   }
```

Here is the relavent html code.

```html
       <form action="http://localhost:8000" method="POST" enctype="multipart/form-data">
        
        <input type="text" name="MYtext">
        <input type="datetime-local" name="MYdatetime">
        <input type="month" name="MYmonth">
        <input type="time" name="Mytime">
        <input type="search" name="MYsearch">
       
        <input type="submit" name="SUBMITTED">

    </form>
```


Here is the Output looks like.

```javascript
{
  MYtext: 'Gold Fish',
  MYdatetime: {
    date: '2021-10-01',
    year: '2021',
    month: '10',
    day: '01',
    time: '00:25',
    hour: '00',
    minute: '25'
  },
  MYmonth: { date: '2021-01', year: '2021', month: '01' },
  Mytime: { time: '20:15', hour: '20', minute: '15' },
  MYsearch: 'search for something',
  SUBMITTED: 'Submit'
}
```
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
