const express=require('express')
const bodyParser=require('body-parser')
const path=require('path')
const mysql=require('mysql');
const app=express();
const router=express.Router();
const Cryptr=require('cryptr');
const cryptr=new Cryptr('myTotalySecretKey');
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs'); 

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sayali@79',
    database: 'diary'
})
  
connection.connect((err)=>{
    if(err) throw err;
    console.log('connected')
}

)

/*connection.query('SELECT first_name FROM employee', function (err,result,cols) {
    if (err) throw err;
    app.route('/log/data').get((req,res)=>{
        res.send(result[1].first_name);
    }); 
})
*/


app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render('landing');
})
app.route('/register').get((req,res)=>{
    return res.render('register');
})
app.route('/log').get(function(req,res){
    return res.render('login')
})
//aes-256-gcm
//Registration:
app.post('/submit',(req,res)=>{
    console.log(req.body);
    const encryptedString=cryptr.encrypt(req.body.password)
    var users={
        "name":req.body.name,
        'email':req.body.email,
        "password":encryptedString
    }
    
    connection.query('INSERT INTO registration SET ?',users,function(err,rows,fields){
        if(err) throw err;
        console.log('The solution is:',rows);
    })
    res.render('submit')
})
//Authentication
var id;

app.post('/diary',(req,res)=>{
    var user_email=req.body.email1;
    console.log(user_email);
    var password=req.body.password1;
    connection.query('SELECT * FROM registration WHERE email=?',[user_email],(err,result,fields)=>{
        console.log(result.length)
        if(err){
           throw err;
        }
        
        else{
            if(result.length>0){
                id=result[0].id;
                const decryptedString=cryptr.decrypt(result[0].password);
                if(password==decryptedString){
                   
                    obj=result[0].name;
                    res.render('website',{obj:obj});
                }
                else{
                    res.render('doesNotMatch')
                }
            }
            else{
                res.render('doesNotExist');
            }
        }
    })
})

app.post('/newlog/submit',(req,res)=>{
    var users={
        "person_id":id,
        "date":req.body.date,
        "message":req.body.message
    }
    
    connection.query('INSERT INTO entries SET ?',users,function(err,rows,fields){
        if(err) throw err;
        console.log('The solution is:',rows);
    })
    res.render('logSubmitted')
})

app.route('/diary/newlog').get((req,res)=>{
    return res.render('newlog');
})
app.route('/diary/all-logs').get((req,res)=>{
    connection.query('SELECT * FROM entries where person_id=?',[id],(err,rows,fields)=>{
        obj=rows;
        console.log(obj);
        return res.render('allLogs',{obj:obj});
    })
    
})

//Update:
var obj;
app.post('/diary/all-logs',(req,res)=>{
    if(req.body.message==''){
        connection.query('DELETE FROM entries WHERE date=?',[req.body.date],(err,rows,fields)=>{
            obj=rows
            console.log(obj)
            res.render('allLogs',{obj:obj});
        })
    }
    else{
        connection.query('UPDATE entries SET message=? WHERE date=?',[req.body.message,req.body.date],(err,rows,fields)=>{
            connection.query('SELECT * FROM entries where person_id=?',[id],(err,rows,fields)=>{
                obj=rows;
                res.render('allLogs',{obj:obj});
            })
        })

    }
    
})


app.route('/diary').get((req,res)=>{
    return res.render('website');
})
app.route('/diary/log').get((req,res)=>{
    return res.redirect('/log');
})
app.route('/newlog/diary').get((req,res)=>{
    return res.redirect('/diary');
})
app.route('/diary/home').get((req,res)=>{
    return res.redirect('/diary');
})




const PORT=process.env.PORT || 5000

app.listen(PORT,()=>console.log(`Server started on port ${PORT}`));
