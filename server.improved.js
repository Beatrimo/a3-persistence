const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://sizheli:WQJmJa6jCL890nXC@cluster0.wmbk7c6.mongodb.net";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let collection = null
client.connect().then( err => {
    return collection = client.db("a3database").collection("survey");
  })
  .then( __collection => {
    // store reference to collection
    collection = __collection
    // blank query returns all documents
    return collection.find({ }).toArray()
  })
  .then( console.log )
    // perform actions on the collection object

const express = require('express'),
    app = express(),
    serveStatic = require('serve-static'),
    bodyparser = require('body-parser'),
    cookieSession = require("cookie-session"),
    cookieParser = require("cookie-parser"),
    mongoose = require('mongoose'),
    GitHubStrategy = require('passport-github2').Strategy,
    passport = require('passport'),
    session = require("express-session");

// use express.urlencoded to get data sent by defaut form actions
// or GET requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
require('dotenv').config();

//app.use(cookieSession({
//   name: "session",
  // where should I get these 2 keys
//   keys: ['key1','key2']
//}))
app.use(session({
  secret: "verygoodsecret",
  resave: false,
  saveUninitialized: true
}));
mongoose.connect(process.env.MONGO_DB_URL);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,

    responseList: {
        response: [{
            name: String,
            gameName: String,
            score: Number,
            comment: Number,
            degree: String
        }]
    }
});

const User = mongoose.model("User", userSchema);


app.use(passport.initialize());
app.use(passport.session());


app.use(express.static('public'))
app.use(bodyparser.json())
app.use(serveStatic('public', { 'index': ['login.html'] }))

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: "https://a3-sizheli-persistence.glitch.me/auth/github/callback"

    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }));


//app.get("/", (request, response) => {
//    response.sendFile(__dirname + "/login.html");
//});
app.get('/auth/error', (req, res) => res.send("Unknown Error"))
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/error' }),
    function(req, res) {
        res.redirect('/response?id=' + req.user.id)
    })

app.get('/response', async(req, res) => {
    const githubUser = new User({
        username: req.query.id,
        password: "",
        responseList: {
            response: []
        }
    });
    githubUser.save();
    req.session.login = true;
    req.session.username = req.query.id;
    res.redirect("edit.html")
});
app.get('/redirectToEdit', bodyparser.json(), (req, res) => {
    if (req.session.login === true) {
        res.json({ redirect: true });
    } else {
        res.json({ redirect: false });
    }
})

app.get('/getUsername', bodyparser.json(), (req, res) => {
    let username = req.session.username;
    res.json({ username: username });
})

app.post('/getTableData', bodyparser.json(), async(req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user !== null) {
        console.log(user.responseList);
        res.json({ rows: user.responseList });
    }
})

+
app.post('/delete', bodyparser.json(), async(req, res) => {
    console.log("Deleting a row!");
    const user = await User.findOne({ username: req.body.username });
    if (user !== null) {
        console.log("Found the user!");
        let rowIndex = req.body.deletingItem;
        user.responseList.response.splice(rowIndex, 1);
        user.save();
        res.json({ success: true });
    }
})

app.post('/edit', bodyparser.json(), async(req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user !== null) {
        let rowIndex = req.body.index;
        console.log("splicing at index" + rowIndex);
        user.responseList.response.splice(rowIndex, 1, req.body);
        console.log(req.body);
        user.save();
        res.json({ success: true });
    }
})

app.post('/submit', bodyparser.json(), async(req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user !== null) {
        user.responseList.response.push(req.body);
        user.save();
        res.json({ success: true });
    }
})


app.post('/login', bodyparser.json(), async(req, res) => {
    console.log(req.body.username);
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user == null) {
        req.session.login = false;
        res.json({ loginSuccess: false });
    } else {
        req.session.login = true;
        req.session.username = req.body.username;
        res.json({ loginSuccess: true });
        console.log("Successful login!");
      
    }


})

app.put('/signOut', (req, res) => {
    req.session.login = false;
    req.session.username = "";
    res.json({ signOutSuccess: true });
});

app.post('/createAccount', bodyparser.json(), async(req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password,
            responseList: {
                response: []
            }
        });
        newUser.save();

        req.session.login = true;
        req.session.username = req.body.username;
        res.json({ registrationSuccess: true });
        console.log("Successful created account!");
    } else {
        req.session.login = false;
        res.json({ registrationSuccess: false });
    }
})





const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});