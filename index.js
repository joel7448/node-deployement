const express = require("express");
const app =express();
const cors = require("cors");
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");
const secret = "YT0e7qync8eaN5U1kF9P"
//connecting mongodb
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const URL ="mongodb://localhost:27017"

app.use(express.json()) //middleware 
app.use(cors({
    origin :"*"
}))

let authenticate = function(req,res,next){
if(req.headers.authorization){
    let verify = jwt.verify(req.headers.authorization,secret);
    if(verify){
        console.log(verify)
req.userid = verify._id;

    next();}
    else{
        res.status(401).json({
            message : "unauthorized"
        })
    }
   
}

} 

const users=[];


app.get ("/students",authenticate,async function(req,res){ //get method - shows the json in  browser when routed 
   try{
    const connection = await mongoclient.connect(URL);  

    const db = connection.db("students")  //select database 

    let students = await db.collection("students").find({userid:mongodb.ObjectId(req.userid)}).toArray() //select collection  //returns a promise

   res.json(students);

    await connection.close() //close the connection //returns a promise


   }
   catch(error){
console.log(error);
   }
    
})

app.post("/student",authenticate, async function(req,res){ //post method //this method receives input from react and pushes the input into an array

    try{
  const connection = await mongoclient.connect(URL);  //open the connection 

  const db = connection.db("students")  //select database 

  req.body.userid=mongodb.ObjectId(req.userid)

  await db.collection("students").insertOne(req.body) //select collection and insert the request //returns a promise

console.log(req.body)

  await connection.close() //close the connection //returns a promise


    res.json({
        message : "student added successfully"
    })
}

catch(error){
    console.log(error); 
}
})

app.get("/students/:id",authenticate,async function(req,res){
   
    try{
        const connection = await mongoclient.connect(URL);  //open the connection 

        const db = connection.db("students")  //select database 

        let students = await db.collection("students").findOne({_id: mongodb.ObjectId(req.params.id)  }); //finding particular document

        await connection.close();

        res.json(students);  

       


    }
catch(error){
console.log(error)

}





})

app.put("/students/:id",authenticate,async function(req,res){
   try{

    const connection = await mongoclient.connect(URL);  //open the connection 

  const db = connection.db("students")  //select database 

  await db.collection("students").updateOne({_id:mongodb.ObjectId(req.params.id)},{$set:req.body})  //updating database

    res.json({
        message : "updated successfully"
    })
}
catch(error){
    console.log(error);
}
    
})

    app.delete("/student/:id",authenticate ,async function (req,res){
try{
        const connection = await mongoclient.connect(URL);  //open the connection 

        const db = connection.db("students")  //select database 

        let students = await db.collection("students").deleteOne({_id : mongodb.ObjectId(req.params.id)}) //deleting the given object_id
       
        await connection.close();

       res.json({
        message : "deleted successfully"
       })}
       catch(error){
        console.log(error)
       }
    })

    app.post("/register",async function(req,res){
        try{
            const connection = await mongoclient.connect(URL);  //open the connection 

            const db = connection.db("b35_tamil") 

            const salt = await  bcryptjs.genSalt(10);

            const hash = await bcryptjs.hash(req.body.password,salt);

            req.body.password=hash;

         

            await db.collection("users").insertOne(req.body);

            await connection.close();

            res.json({
                message : "Registered"
            })
        }
        catch(error){
            console.log(error);
        }
    })




    app.post("/login",async function (req,res){
try{
    const connection = await mongoclient.connect(URL);  //open the connection 

    const db = connection.db("b35_tamil");

    const user = await db.collection("users").findOne({name:req.body.name})

    if(user){
const match = await bcryptjs.compare(req.body.password,user.password); //compares input password with hash



if(match){

    const token = jwt.sign({_id : user._id},secret,{expiresIn:"5m"});  //returns token and payload can be given
console.log(token);
res.json({
    message:"Successfully logged in",
    token
})

}
else{
    res.status(401).json({
        message : "Incorrect password"
    })
}
    }   
    else{
        res.status(401).json({
            message:"user not found"
        })
    } 
}
catch(error){
    
console.log(error)

}

    })


app.listen(process.env.PORT || 3000);