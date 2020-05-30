const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const {parse} =require("querystring");



const app = express();
// app.use(cors());
const port = 3001;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



const mongoUrl = "mongodb://localhost:27017/FarmerDB"


mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true

});

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error" ));
db.once("open" , () => {
  console.log("Connected to Mongo Db");
});


const itemSchema = new mongoose.Schema( {
      name:String
   });

  const farmerSellingList = new mongoose.Schema({
    name:String,
    price: Number,
    minQty: Number
  });

  const farmerSchema = new mongoose.Schema({
    name:String,
    mobile:String,
    password: String
  });

  farmerSchema.plugin(passportLocalMongoose);

  const Farmer = mongoose.model("Farmer", farmerSchema);

  passport.use(Farmer.createStrategy());

  // use static serialize and deserialize of model for passport session support
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  const Item = mongoose.model("Item", itemSchema);

  const maize = new Item({ name:"maize" });

  const onion = new Item({name:"Onion" });

  const tomato = new Item({name:"Tomato"});

  const wheat = new Item({ name:"wheat" });
  const defaultItems = [maize, onion, tomato, wheat]


app.get("/", (req, res)=> {
    res.render("home");
});

app.get("/register", (req, res)=> {
    res.render("register");
});

app.get("/login", (req, res)=> {
    res.render("login");
});


app.post("/saveFarmerItemList", (req,res) => {

// var items = req.body.data.split(",");
// console.log(req.body.data);
// console.log(req.body.data.split(","));
let obj = JSON.parse(req.body.data);
console.log(obj.length);
obj.forEach(function (item) {
  console.log(item.Id + " "+ item.price + " "+ item.minQty);
});
// let body ='';
// req.on('data', chunk => {body+=chunk.toString()} );
// req.on('end', ()=> {console.log(parse(body.data)  ) ;
//   res.end('ok') ;
//
//
//
//
//
// }) ;

  // let data = String(req.body);
  // let newData = data.substring(  0, data.length -3);
  //
  //   console.log(newData);

    // console.log( req.body);





});

app.get("/welcome", (req, res) => {
  if(req.isAuthenticated()) {
    res.render("welcome");
  }
  else {
    res.redirect("/login")
  }
} );


app.get("/createShop", (req,res) => {
  Item.find({},  function (err, foundItems) {
     if(foundItems.length === 0 ) {
       Item.insertMany(defaultItems, (err) => {
         if(err) {
           console.log(err);
         }else {
           console.log("Successfully inserted items in db");
         }
       });
     }
     res.render("createShop", { itemList: foundItems});
   });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});


app.post("/login", (req, res) => {
  const username= req.body.username;
  console.log("username "+ username);
  const farmer = new Farmer({
    username:req.body.username,
    password:req.body.password
  });

  req.login(farmer,function (err) {
    if(err) {
      console.log("Error "+ err);
    }
    else {
      passport.authenticate("local")(req, res, function() {
        Item.find({},  function (err, foundItems) {
           if(foundItems.length === 0 ) {
             Item.insertMany(defaultItems, (err) => {
               if(err) {
                 console.log(err);
               }else {
                 console.log("Successfully inserted items in db");
               }
             });
           }
           res.render("welcome", {farmer:username, itemList: foundItems});
         });

      });
    }
  });
});

app.post("/register", function ( req, res ) {
    const username = req.body.username;
    let lowerCase = _.lowerCase(username);
    let updatedUsername = lowerCase.replace(/\s/g, "");
  Farmer.register({username: updatedUsername, mobile: req.body.mobile}, req.body.password, function (err, user) {
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else {
      passport.authenticate("local")(req, res, function() {
        Item.find({},  function (err, foundItems) {
           if(foundItems.length === 0 ) {
             Item.insertMany(defaultItems, (err) => {
               if(err) {
                 console.log(err);
               }else {
                 console.log("Successfully inserted items in db");
               }
             });
           }
           res.render("welcome", {farmer:username, itemList: foundItems});
         });

      });
    }
  });
});


app.get("/:username", (req, res) => {
  const username = _.lowerCase(req.params.username);
  console.log(username);
  Farmer.findOne({username:username}, (err,foundFarmer)=> {
    if(!err && !foundFarmer ) {
      console.log("farmer with specified name not found" + foundFarmer);
      Farmer.find((err,foundFarmers) => {
        res.render("farmerList", {farmerList: foundFarmers});
      });
    } else {
      console.log("match found" + foundFarmer);
      res.render("shop", {farmer:foundFarmer})
      // res.redirect("/"+username);
    }
  });
});
app.listen(port, ()=>{
    console.log(`Friendly App running at port ${port}`);
} );
