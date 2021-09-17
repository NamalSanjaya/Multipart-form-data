# __simple-multipart-formdata__

#### __Installation :__

```
npm install simple-multipart-formdata

```


---

### <span style="color:lightgreen"> Simple API to parse multipart-formdata into a readable object literal.</span>

__Note :__ It will not work with static types such as file or image.


### __Example__
```javascript

const { bodyParser } = require('simple-multipart-formdata');

let output           =  bodyParser( Message );  

```
### __Explanation__

<span style="color:pink">Message</span><span style="color:lightblue"> is the multipart-form-data as __*string*__. It will convert into an object which has properly seperated message body data.</span>

<span style="color:pink">output</span> <span style="color:lightblue"> 
is the return object from __bodyParser(*string*)__ API.</span>
 

## __API__

```
bodyParser( [string] )
```
<span style="color:lightgreen">return : { fields : data } </span>

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
 
