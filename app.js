const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

var PassportHerokuAddon = require('passport-heroku-addon');


const {
  parse
} = require("querystring");

const app = express();
// app.use(cors());
// const port = 3001;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(bodyParser.json());

app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// const mongoUrl = "mongodb://localhost:27017/FarmerDB"

const mongoUrl = "mongodb+srv://admin-gaurav:Rssbdb@1@cluster0-4uxnp.mongodb.net/farmerDB?retryWrites=true&w=majority";
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true

});

let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Connected to Mongo Db");
});


const sellingItemSchema = new mongoose.Schema({
  farmerName:String,
  farmerId:String,
  itemId: String,
  itemName: String,
  price: Number,
  minQty: Number
});
const orderDetailSchema = new mongoose.Schema({
  itemId: String,
  itemName: String,
  price: Number,
  purchaseQty: Number
});

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);

const orderSchema = new mongoose.Schema({
  farmerName:String,
  farmerId:String,
  farmerMobile:String,
  customerName: String,
  customerMobile: String,
  society: String,
  isDelivered: Boolean,
  total:Number,
  orderDetail: [orderDetailSchema]
});

const farmerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  password: String,
  sellingList: [sellingItemSchema],
  orderList: [orderSchema]

});
farmerSchema.plugin(passportLocalMongoose);
const Farmer = mongoose.model("Farmer", farmerSchema);
passport.use(Farmer.createStrategy());



const customerSchema = new mongoose.Schema({
  username:String,
  name: String,
  password:String,
  society:String,
  email:String
});
// customerSchema.plugin(passportLocalMongoose);
const Customer = mongoose.model("Customer", customerSchema);
// passport.use(Customer.createStrategy());


// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const itemSchema = new mongoose.Schema({
  name: String
});



const Order = mongoose.model("Order", orderSchema);

const SellingItem = mongoose.model("SellingItem", sellingItemSchema);


const Item = mongoose.model("Item", itemSchema);

const maize = new Item({  name: "maize"});

const onion = new Item({  name: "Onion"});

const tomato = new Item({  name: "Tomato"});

const wheat = new Item({  name: "wheat"});
const defaultItems = [maize, onion, tomato, wheat]


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register",{"errorMessage":""});
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/deleteOrder", (req,res) => {
  console.log("deleting order");
  const orderId= req.body.orderId;
  let farmer ;
  Order.findOne({_id:orderId}, (err, foundOrder)=> {
    farmerName = foundOrder.farmerName;
  });
  Order.deleteOne({_id:orderId}, (err, result) => {
    if(result.deletedCount > 0) {
      // res.send("Successfully deleted order");
      res.render("orderDeletionConfirmation", {farmerName:farmerName});
    }
    else {
      res.send("No matching order found to delete");
    }
  });
});
app.post("/updateOrder", (req,res)=> {
  const orderId= req.body.orderId;
  const farmerName = req.body.farmerName;

  Order.updateOne({_id:orderId}, {isDelivered:true}, err =>{
    if(!err) {
      Order.find({farmerName:farmerName, isDelivered:false}, (err, orderList) => {
        // console.log("order list for "+ orderList);
        res.render("orderPage", {farmer:foundFarmer,orderList:orderList});
      });

    }
  });
})
app.post("/placeOrder", (req, res) => {
  let farmerName = req.body.farmerName;
  let dataObject = JSON.parse(req.body.data);
  let customerName = req.body.customerName;
  let customerSociety = req.body.customerSociety;
  let customerMobile = req.body.customerMobile;
  let total= req.body.orderTotal;
  let customerEmail= req.body.customerEmail;
  if(customerEmail === "") {
    customerEmail = customerName + customerMobile + "@gmail.com";
  }
  console.log("email " + customerEmail);

  let existingCustomer =true;

  let recentOrder ;

  Customer.findOne(
    {username:customerMobile }, (err, foundCustomer) => {
        if(!foundCustomer) {
          existingCustomer =false;
          const customer = new Customer({
            name:customerName,
            username: customerMobile,
            password:"1234",
            society:customerSociety,
            email:customerEmail
        });
        customer.save(err => {
          if(err) {
            console.log("error saving customer" + err);
          }
          else {
            console.log("Customer saved successfully");
          }
        });
      }
    });

  Farmer.findOne({
    username: farmerName
  }, (err, foundFarmer) => {
    if (!err && foundFarmer) {
      // let orderValue =0;
      const orderDetailArray = [];
      let purchaseOrder = new Order({
        farmerName:foundFarmer.username,
        farmerId:foundFarmer._id,
        farmerMobile:foundFarmer.mobile,
        customerName: customerName,
        customerMobile: customerMobile,
        society: customerSociety,
        isDelivered: false,
        total:total,
        orderDetail: []
      });

      dataObject.forEach(function(item) {
        let currentOrder = new OrderDetail({
          itemId: item.id,
          itemName: item.itemName,
          price: item.price,
          purchaseQty: item.purchaseQty
        });

        orderDetailArray.push(currentOrder);


        currentOrder.save(err => {
          if (err) {
            console.log("error while saving order details " + err);
          } else {
            console.log("order details  saved ");
          }
        });
      });

      purchaseOrder.orderDetail = orderDetailArray;
      purchaseOrder.save((err,order) => {
        if (err) {
          console.log("error while saving purchaseOrder " + err);
        } else {
          console.log("p o saved " );
          recentOrder = order;
        }
      });

      foundFarmer.orderList.push(purchaseOrder);
      foundFarmer.save(err => {
        if (!err) {
          res.render("orderConfirmation", {
            message: "success",
            customerName: customerName,
            customerMobile:customerMobile,
            orderReceived: orderDetailArray,
            farmer: foundFarmer,
            orderValue:total,
            purchaseOrder:recentOrder,
            existingCustomer:existingCustomer
          });
        } else {
          res.render("orderConfirmation", {
            message: "failure",
            customerName: customerName,
            orderReceived: orderDetailArray,
            farmer: foundFarmer,
            orderValue:total,
            purchaseOrder:recentOrder,
            existingCustomer:existingCustomer
          });
        }
      });


    } else {
      // console.log("match found" + foundFarmer);
      res.render("shop", {
        farmer: foundFarmer
      });
      // res.redirect("/"+username);
    }
  });


});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;

  Item.deleteOne({_id:checkedItemId} , err => {
    if(!err) {
      res.redirect("/compose");
    }
  });
});

app.post("/addItem", (req,res) =>{
  const newItem = req.body.newItem;
  const item = new Item({name:newItem});
  item.save();
  res.redirect("/compose");
});

app.get("/compose", (req,res) => {
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
    res.render("list", {listItems: foundItems});
  });
});



app.post("/saveFarmerItemList", (req, res) => {

  let farmerName = req.body.farmerName;
  let dataObject = JSON.parse(req.body.data);

  Farmer.findOne({
    username: farmerName
  }, (err, foundFarmer) => {
    if (!err && foundFarmer) {
      console.log("farmer found :" + foundFarmer);
      const itemList = [];
      dataObject.forEach(function(item) {
        // console.log(item.id + " " + item.itemName + " " + item.price + " " + item.minQty);
        let sellingItem = new SellingItem({
          farmerName:farmerName,
          farmerId:foundFarmer.Id,
          itemId: item.id,
          itemName: item.itemName,
          price: item.price,
          minQty: item.minQty
        });

        itemList.push(sellingItem);
        console.log("Item list length : " + itemList.length);
        sellingItem.save();
      });

      Farmer.updateOne({username: farmerName}, {
        sellingList: itemList
      }, function(err) {
        if (!err) {
          console.log("successfully inserted itemlist");
          Farmer.find({
            username: farmerName
          }, (err, foundFarmer) => {
            if (!err && foundFarmer) {
              res.render("welcome", {
                listExist: true,
                farmerName: farmerName,
                itemList: itemList,
                farmer: foundFarmer
              });
            }
          })

        } else {
          console.log(err);
        }
      });


    } else {
      console.log("farmer not found" );
      res.render("shop", {
        farmer: foundFarmer
      })
      // res.redirect("/"+username);
    }
  });
});

app.get("/welcome", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("welcome");
  } else {
    res.redirect("/login")
  }
});


app.get("/createShop", (req, res) => {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted items in db");
        }
      });
    }
    res.render("createShop", {
      itemList: foundItems
    });
  });
});

app.get("/reset/:farmerName", (req,res) => {
  const farmerName = req.body.params;
  SellingItem.deleteMany({farmerName:farmerName}, err=> {
    if(!err) {
      Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
          Item.insertMany(defaultItems, (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully inserted items in db");
            }
          });
        }

        res.render("welcome", {
          farmerName: farmerName,
          itemList: foundItems,
          listExist: false
        });
      });
    }
  });
});
app.get("/orders/:farmerName", (req,res) => {
// console.log(req.params.farmerName);
const farmerName = req.params.farmerName;
Farmer.findOne({username:farmerName}, (err, foundFarmer) => {
  Order.find({farmerName:farmerName, isDelivered:false}, (err, orderList) => {
    // console.log("order list for "+ orderList);
    res.render("orderPage", {farmer:foundFarmer.username, orderList:orderList});
  });

});

});

app.get("/customerOrders/:username", (req,res) => {

const customerMobile = req.params.username;
Customer.findOne({username:customerMobile}, (err, foundCustomer) => {

  if(!err && foundCustomer) {
    console.log("customer "+ foundCustomer);
    Order.find({customerMobile:customerMobile, isDelivered:false}, (err, orderList) => {
      // console.log("order list for "+ orderList);
      res.render("customerOrders", {customer:foundCustomer, orderList:orderList});
    });

  }
  else {
    console.log("not found customer");
  }



});

});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/modifyCustomerOrders/:orderId/", (req,res) => {
   const orderId = req.params.orderId;
   // const username= req.params.username;
   // console.log(orderId );
   // check if order id exists/
   Order.findOne({_id:orderId}, (err, foundOrder) => {
     if(!err && foundOrder) {
       res.render("order", {order:foundOrder});
     }
   });

  // show that order to customer and when he updates it update in db.
});

app.get("/changePassword/:username",(req,res) => {

const customerMobile = req.params.username;
Customer.findOne({username:customerMobile}, (err, foundCustomer) => {
  if(!err && foundCustomer) {
    console.log("customer "+ foundCustomer);
      res.render("changePassword", {customer:foundCustomer});
  }
  else {
    console.log("not found customer");
  }
});
});

app.post("/changeCustomerPassword", (req,res)=> {
  const username = req.body.username;
  const password = req.body.password;
  // update passwored.

  Customer.findOne({username:username}, (err, foundCustomer) => {
    if(!err && foundCustomer) {
      Customer.updateOne({username:username},
        {password:password}, (err) => {
          if(!err) {
            console.log("updated password");
            // res.render("customerHome", {customer:foundCustomer, message:"Password updated Successfully"});
            res.render("customerSignIn");
          }
          else {
            console.log("issue updating password");
          }
        });

    }
  });

});


// app.get("/admin")

app.post("/customerLogin", (req,res) => {
  const username = req.body.username;

  const customer = new Customer({
    mobile:req
  });
});


app.get("/customerSignIn", function(req, res){
  res.render("customerSignIn");
});

app.post("/customerSignIn", function(req, res){
  const mobile = req.body.mobile;

  const customer = new Customer({
    mobile:req.body.mobile,
    password:req.body.password
  });

  Customer.findOne({username:req.body.mobile}, (err, foundCustomer) => {
    if(!err && foundCustomer) {
      if(foundCustomer.password === req.body.password) {
        res.render("customerHome", {customer:foundCustomer, message:""});
      }else {

      }
    }
    else {
      console.log("customer doesnot exists");
      res.render("customerSignIn", { errorMessage:"Customer Doesn't Exist"});
      // res.redirect("customerSignIn");
    }
  });
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log("username " + username);
  const farmer = new Farmer({
    username: req.body.username,
    password: req.body.password
  });

  req.login(farmer, function(err) {
    if (err) {
      console.log("Error " + err);
    } else {
      passport.authenticate("local")(req, res, function() {
      // passport.authenticate("local")( function(req, res) {

        Farmer.findOne({username: username}, (err, foundFarmer) => {
          if (!err && foundFarmer) {
            console.log("selling list length  "+ foundFarmer.sellingList.length);
            // console.log(foundFarmer.sellingList);
            // console.log(JSON.parse(foundFarmer.sellingList));
            if (foundFarmer.sellingList.length > 0) {
              // selling list

              console.log("farmer selling list length " + farmer.sellingList.length);

              res.render("welcome", {
                listExist: true,
                farmerName: username,
                itemList: foundFarmer.sellingList,
                message:""
              });

            } else {
              // item list
              Item.find({}, function(err, foundItems) {
                if (foundItems.length === 0) {
                  Item.insertMany(defaultItems, (err) => {
                    if (err) {
                      console.log(err);

                    } else {
                      console.log("Successfully inserted items in db");
                    }
                  });
                }
                console.log("found items length "+ foundItems.length);
                res.render("welcome", {
                  listExist: false,
                  farmerName: username,
                  itemList: foundItems,
                  message:"Setup your Shop"

                });
              });
            }

          }
        });
      });
    }``
  });
});

app.post("/register", function(req, res) {
  const username = req.body.username;
  let lowerCase = _.lowerCase(username);
  let updatedUsername = lowerCase.replace(/\s/g, "");
  Farmer.register({
    username: updatedUsername,
    mobile: req.body.mobile
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      // res.redirect("/register");
      res.render("register", {
        errorMessage: "A user with the given username is already registered"
      });
    } else {
      passport.authenticate("local")(req, res, function() {
        console.log("registed");

        Item.find({}, function(err, foundItems) {
          if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
              if (err) {
                console.log(err);

              } else {
                console.log("Successfully inserted items in db");

              }
            });
          }
          res.render("successRegister", {username:username});

          // res.render("welcome", {
          //   farmerName: username,
          //   itemList: foundItems,
          //   listExist: false,
          //   message:"Enter price and Min Quantity for items you sell.."
          // });
        });

        console.log("registerd");

      });
    }
  });
});


app.get("/:username", (req, res) => {
  const username = _.lowerCase(req.params.username);
  console.log(username);
  Farmer.findOne({
    username: username
  }, (err, foundFarmer) => {
    if (!err && !foundFarmer) {
      Farmer.find((err, foundFarmers) => {
        res.render("farmerList", {
          farmerList: foundFarmers
        });
      });
    } else {

      res.render("shop", {
        farmer: foundFarmer
      })

    }
  });
});

let port = process.env.PORT;
if(port == null || port == "") {
  port =3000;
}
app.listen(port, () => {
  console.log(`Friendly App running at port ${port}`);
});
