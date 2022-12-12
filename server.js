require('dotenv').config()
const express = require('express');
const path = require('path')
const mysql = require('./connection').con;

app = express();
app.set("view engine", "ejs")
app.set("views", "./frontend/views")

app.use('/img', express.static(path.resolve(__dirname, "../frontend/assets/img")))
app.use('/css', express.static(path.resolve(__dirname, "../frontend/assets/css")))
app.use('/js', express.static(path.resolve(__dirname, "../frontend/assets/js")))

//To handle post request
app.use(express.urlencoded())
app.use(express.json())

app.get('/', (req, res) => {
    res.render('register', {msg: false, check:false});
})

app.get('/login', (req, res) => {
    res.render('login', {msg: false, check:false})
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {response: false, Name:"", Age:"", Phone:"", Password:"", Gender:"", Slot:"", Fees:""})
})

app.get('/payFees', (req, res) => {
    res.send('<h2>Calling Function to Pay Fees.....</h2>')
});


app.post("/dashboard", (req, res) => {
    try{
        const {name, age, phone, password, gender, slot} = req.body;
        
        if(!name){
            throw err
        }
        let qry = `select * from Members where Phone=${phone}`;
        mysql.query(qry, (err, results) => {
            if(err)
                throw err;
            else{
                if(results.length > 0){
                    // res.send("Already a Member")
                    res.render("register", {msg: false, check: true})
                    
                }else{
                    //insert query
                    let qry2 = "insert into Members(Name, Age, Phone, Password, Gender, Slot) values(?,?,?,?,?,?);";
                    mysql.query(qry2, [name, age, phone, password, gender, slot], (err, result) => {
                        if(err) throw err;
                        let qry3 =  `insert into Slots(Phone, Slot) values('${phone}','${slot}')`
                        mysql.query(qry3, (err, result1) => {
                            if(err) throw err;
                            // console.log(result)
                            
                            if(result.affectedRows > 0){
                            res.render('dashboard', {response: true, Name:name, Age:age, Phone:phone, Password:password, Gender:gender, Slot:slot, Fees: "NO", nextslot: slot})
                            //console.log('line 84')
                            }
                        })
                    })
                }
            }
        })
    }catch(err){
        
        const {phone, password} = req.body;

        let qry = `select * from Members where Phone=${phone}`;
        mysql.query(qry, (err, results) => {
            if(err)
                throw err;
            else{
                if(results.length == 0){
                    // res.send("Not a Member")
                    res.render("login", {msg: false, check: true})
                }else{
                    //insert query
                    let qry2 = "select * from Members where Phone=? and Password=?";
                    mysql.query(qry2, [phone, password], (err, result) => {
                       
                        try{
                        const {Name, Age, Phone, Password, Gender, Slot, Fees} = result[0];
                        let qry3 = `SELECT Slot from Slots where Phone=${phone}`
                        mysql.query(qry3, (err, result1) => {
                            nextslot = result1[0]['Slot']
                            // console.log(nextslot)
                            res.render('dashboard', {response: true, Name: Name, Age: Age, Phone: Phone, Gender: Gender, Slot: Slot, Fees: Fees, nextslot: nextslot})
                        })
                        }catch{
                            res.render('login', {msg: true, check: false})
                        }

                    })
                }
            }
        })
    }
})

app.post('/save', (req, res) => {
    
    let qry1 = "select * from Slots where Phone=?";
    const {slot, phone} = req.body;
    mysql.query(qry1, [phone], (err, result) => {
        
        if(result.length > 0){
            //already changed once
            let qry2 = "UPDATE Slots SET slot=? WHERE phone=?";
            mysql.query(qry2, [slot, phone], (err, result) => {
                if(err){
                    res.send("Some error Occured!")
                }else{
                    res.render('save')
                }
            })
        }else{
            let qry2 = "insert into Slots values(?,?)";
            mysql.query(qry2, [phone, slot], (err, result) => {
                if(err){
                    res.send("Some Error Occured");
                }else{
                    res.render('save')
                }
            })
            
        }

    })
})

app.listen(process.env.APP_PORT, ()=>{
    console.log(`Server is running on port ${process.env.APP_PORT}`)
})