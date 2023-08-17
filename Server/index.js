const express =require("express");
const app =express();
require("dotenv").config();
const pool = require("./db");
const {v4:uuidv4} =require("uuid");
const cors =require("cors");
const bcrypt =require("bcrypt")
const jwt =require("jsonwebtoken");
const port = process.env.PORT || 4000

app.use(express.json());
app.use(cors());

// get all todos

app.get("/todos/:useremail",async(req,res)=>{
    const useremail =req.params.useremail;
    try {
        const todos =await pool.query("SELECT * FROM todos WHERE user_email=$1",[useremail]);
        res.json(todos.rows);
    } catch (error) {
        console.log(error);
    }
})


// create a todo

app.post("/todos",async(req,res)=>{
    const {user_email,title,progress,date}=req.body;
    const id = uuidv4();
    // console.log(user_email,title);
    try {
        const newtodo = await pool.query("INSERT INTO todos(id,user_email,title,progress,date) VALUES($1,$2,$3,$4,$5)",[id,user_email,title,progress,date])
        res.json(newtodo.rows);
    } catch (error) {
        console.log(error);
    }
})

// edit a todo
 app.put("/todos/:id",async(req,res)=>{
    const {id}=req.params;
    const {user_email,title,progress,date} =req.body;
    try {

        const edittodo = await pool.query("UPDATE todos SET user_email=$1,title=$2,progress=$3,date=$4 WHERE id=$5",[user_email,title,progress,date,id]);
        res.json(edittodo.rows);
    } catch (error) {
      console.log(error);  
    }
 })

//  delete a todo

app.delete("/todos/:id",async(req,res)=>{
    const {id}=req.params;
    try {
        const deleteddata = await pool.query("DELETE FROM todos WHERE id=$1",[id]);
        res.json("deleted todo succesfully");    
    } catch (error) {
        console.log(error);
    }
})


// signup user
app.post("/signup",async(req,res)=>{
    const {email,password}=req.body;
    const salt = bcrypt.genSaltSync(10)
    const hashedpassword =bcrypt.hashSync(password,salt);
    try {
        const usersignup = await pool.query(`INSERT INTO users(email,hashed_password) VALUES($1,$2)`,[email,hashedpassword]);
        const token = jwt.sign({email},'secret',{expiresIn:'1hr'})
        res.json({email,token});        
    } catch (error) {
      console.log(error);  
    }
})

// login route

app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try {
        const users = await pool.query(`SELECT * FROM users WHERE email=$1`,[email]);
        if(!users.rows.length) return res.json({detail:"User does not exist"});
        const success = await bcrypt.compare(password,users.rows[0].hashed_password);
        const token = jwt.sign({email},'secret',{expiresIn:'1hr'})
        if(success){
            res.json({"email":users.rows[0].email,token})
        }
        else{
            res.json({detail:"Login Failed"});
        }
    } catch (error) {
        console.log(error);
    }
})





app.listen(port,()=>{
    console.log(`server listening on port no ${port}`)
})