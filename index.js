const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const _ = require("lodash");

// Setting the preferences 

const app = express();
app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: true }));

// Initialise the connection to the database
const mongoDBConnectionString = process.env.MONGODB_URI;
mongoose.connect(mongoDBConnectionString).catch((error) => { console.error(error) });
// mongoose.connect("mongodb+srv://vercel-admin-user-64d65e4e877fad3dcc5a0752:inGKMeLOgRMM1zQI@cluster0.gwwyia0.mongodb.net/todoListDB").catch((error)=>{console.error(error)});

// Creating the schema and model 

const inputsSchema = {
    Name: String
};

const Input = mongoose.model("Input", inputsSchema);

const listSchema = {
    Name: String,
    Item: [inputsSchema]
};

const List = mongoose.model("List", listSchema);

// Rendering the date
const currentDay = new Date();
const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}
const day = currentDay.toLocaleDateString("en-US", options);

// Setting the default value in the database

const input1 = new Input({
    Name: "Welcome to your Todo List"
});
const input2 = new Input({
    Name: "Hit + to add new task"
});
const input3 = new Input({
    Name: "Hit the checkbox to delete the task"
})
const defautltItems = [input1, input2, input3];


// Setting the routes 

app.get("/", (req, res) => {
    Input.find({})
        .then(Inputs => {
            if (Inputs == 0) {
                Input.insertMany(defautltItems).then(console.log("Tasks Added Sucessfully!!"))
                    .catch(error => {
                        console.error("The error occured is : ", error);
                    });
            }
            else {
                const title = "Today";
                res.render('index', { listTitle: title, date: day, newListItems: Inputs });
            }
            console.log(Inputs);
        })
        .catch(error => {
            console.error("The error shown is: ", error)
        });
});


app.post("/", (req, res) => {
    let listName = req.body.list;
    const inputName = req.body.task;
    const input = new Input({
        Name: inputName
    });
    if (listName === "Today") {
        input.save();
        res.redirect("/");
    }
    else {
        List.findOne({ Name: listName })
            .then(foundList => {
                if (foundList) {
                    foundList.Item.push(input);
                    foundList.save();
                    res.redirect("/" + listName);
                }
                else {
                    console.log("List not found");
                    res.redirect("/");
                }
            })
            .catch(error => {
                console.error(error);
                res.redirect("/")
            });
    }
})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Input.findByIdAndRemove(checkedItemId).then(res.redirect("/")).catch((error) => { console.error("The error is: ", error) });
    }
    else {
        List.findOneAndUpdate({ Name: listName }, { $pull: { Item: { _id: checkedItemId } } })
            .then(res.redirect("/" + listName)).catch((error) => { console.error("The error is: ", error) });
    }
});

app.get("/:title", (req, res) => {
    const title = _.capitalize(req.params.title);
    List.findOne({ Name: title })
        .then(foundList => {
            if (!foundList) {
                // Create a list
                const list = new List({
                    Name: title,
                    Items: defautltItems
                });
                list.save();
                console.log("List does not exist");
                res.render('index', { title: title, listTitle: title, date: day, newListItems: defautltItems });
            } else {
                // Render the existing list
                console.log("List exists");
                res.render('index', { title: title, date: day, listTitle: title, newListItems: foundList.Item });
            }
        })
        .catch(error => {
            console.error(error);
        });
});

app.get("/about", (req, res) => {
    res.render('about');
});
app.listen(process.env.PORT || 3000, () => {
    console.log("[Status] The server is running on port 3000");
});

// Vercel changes