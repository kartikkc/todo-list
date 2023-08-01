const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: true }));

const currentDay = new Date();
const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}
let inputs = [];
let workItems = [];
let title = "";
const day = currentDay.toLocaleDateString("en-US", options);
app.get("/", (req, res) => {
    res.render('index', { date: day, newListItems: inputs });
})
app.post("/", (req, res) => {
    let listName = req.body.button;
    if (listName == "Work") {
        workItems.push(req.body.task);
        console.log("[Input] " + workItems);
        res.redirect("/work");
    }
    else {
        inputs.push(req.body.task);
        console.log("[Input] " + inputs);
        res.redirect("/");
    }
    console.log(req.body.listItem);
})

app.get("/work", (req, res) => {
    title = "Work List"
    res.render('index', { date: title, newListItems: workItems });
})
app.post("/work", (req, res) => {
    workItems.push(req.body.task);
    console.log("[Input] " + workItems);
    res.redirect("/work");
})
app.get("/about", (req, res) => {
    title = "Work List"
    res.render('about', { date: title, newListItems: workItems });
})
app.listen(process.env.PORT || 3000, () => {
    console.log("[Status] The server is running on port 3000");
})

