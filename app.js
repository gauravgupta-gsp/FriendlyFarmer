const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const {
  parse
} = require("querystring");



const app = express();
// app.use(cors());
const port = 3001;
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


const mongoUrl = "mongodb://localhost:27017/FarmerDB"

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


const itemSchema = new mongoose.Schema({
  name: String
});

const sellingItemSchema = new mongoose.Schema({
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
  customerName: String,
  customerMobile: String,
  society: String,
  isDelivered: Boolean,
  orderDetail: [orderDetailSchema]
});

const Order = mongoose.model("Order", orderSchema);

const SellingItem = mongoose.model("SellingItem", sellingItemSchema);

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

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const Item = mongoose.model("Item", itemSchema);

const maize = new Item({
  name: "maize"
});

const onion = new Item({
  name: "Onion"
});

const tomato = new Item({
  name: "Tomato"
});

const wheat = new Item({
  name: "wheat"
});
const defaultItems = [maize, onion, tomato, wheat]


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/updateOrder", (req,res)=> {
  console.log(req.body.orderId);
})
app.post("/placeOrder", (req, res) => {
  let farmerName = req.body.farmerName;
  let dataObject = JSON.parse(req.body.data);
  let customerName = req.body.customerName;
  let customerSociety = req.body.customerSociety;
  let customerMobile = req.body.customerMobile;

  Farmer.findOne({
    username: farmerName
  }, (err, foundFarmer) => {
    if (!err && foundFarmer) {

      const orderDetailsList = [];
      let purchaseOrder = new Order({
        farmerName:foundFarmer.username,
        farmerId:foundFarmer._id,
        customerName: customerName,
        customerMobile: customerMobile,
        society: customerSociety,
        isDelivered: false,
        orderDetail: []

      });
      dataObject.forEach(function(item) {
        console.log(item.id + " " + item.itemName + " " + item.price + " " + item.purchaseQty);

        let currentOrder = new OrderDetail({
          itemId: item.id,
          itemName: item.itemName,
          price: item.price,
          purchaseQty: item.purchaseQty
        });

        orderDetailsList.push(currentOrder);


        currentOrder.save(err => {
          if (err) {
            console.log("error while saveing order details " + err);
          } else {
            console.log("oreder details  saved ");
          }
        });
      });

      purchaseOrder.orderDetail = orderDetailsList;
      purchaseOrder.save(err => {
        if (err) {
          console.log("error while saveing purchaseOrder " + err);
        } else {
          console.log("p o saved ");
        }
      });

      foundFarmer.orderList.push(purchaseOrder);
      foundFarmer.save(err => {
        if (!err) {
          res.render("orderConfirmation", {
            message: "failure",
            customerName: customerName,
            orderReceived: dataObject,
            farmer: foundFarmer
          });
        } else {
          res.render("orderConfirmation", {
            message: "failure",
            customerName: customerName,
            orderReceived: dataObject,
            farmer: foundFarmer
          });
        }
      });


    } else {
      console.log("match found" + foundFarmer);
      res.render("shop", {
        farmer: foundFarmer
      });
      // res.redirect("/"+username);
    }
  });


  console.log(dataObject);

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
          itemId: item.id,
          itemName: item.itemName,
          price: item.price,
          minQty: item.minQty
        });

        itemList.push(sellingItem);
        console.log("Item list length : " + itemList.length);
        sellingItem.save();
      });

      Farmer.updateOne({
        username: farmerName
      }, {
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
                itemList: [],
                farmer: foundFarmer
              });
            }
          })

        } else {
          console.log(err);
        }
      });


    } else {
      console.log("match found" + foundFarmer);
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

app.get("/orders/:farmerName", (req,res) => {
// console.log(req.params.farmerName);
const farmerName = req.params.farmerName;
Farmer.findOne({username:farmerName}, (err, foundFarmer) => {
  Order.find({farmerName:farmerName, isDelivered:false}, (err, orderList) => {
    console.log("order list for "+ orderList);
  });
  res.render("orderPage", {farmer:foundFarmer});
});

});


app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// app.get("/admin")

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

        Farmer.findOne({username: username}, (err, foundFarmer) => {
          if (!err && foundFarmer) {
            console.log(foundFarmer.sellingList.length);
            // console.log(foundFarmer.sellingList);
            // console.log(JSON.parse(foundFarmer.sellingList));
            if (foundFarmer.sellingList.length > 0) {
              // selling list

              res.render("welcome", {
                listExist: true,
                farmerName: username,
                itemList: foundFarmer.sellingList
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
                res.render("welcome", {
                  listExist: false,
                  farmerName: username,
                  itemList: foundItems
                });
              });
            }

          }
        });
      });
    }
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
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {

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
            farmerName: username,
            itemList: foundItems,
            listExist: false
          });
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
app.listen(port, () => {
  console.log(`Friendly App running at port ${port}`);
});
