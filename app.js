import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { mongoose, connect, Schema, model } from "mongoose";

const app = express();
const port = 3000;

// set EJS as template engine

app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

// **middleware to manually set the header content of my css to text/css Not needed bc express.static() does it
// Automatically

// app.use((req, res, next) => {
//   if (req.url.endsWith(".css")) {
//     res.setHeader("Content-Type", "text/css");
//   }
//   next();
// });

// mongodb connection

const url = "mongodb://0.0.0.0:27017/todolistDB";

async function main() {
  await connect(url);
  console.log("Connected to MongoDB");
}

try {
  main();
} catch (error) {
  console.log("Error: ", error);
}

// ************************************************************
// create schema for todo list item

const todoItemSchema = new Schema({
  title: String,
  // completed: { type: Boolean, default: false },
});

// create model for todo list item
const Item = model("Item", todoItemSchema);

// create todo list item

const work = new Item({
  title: "Work",
});

const sleep = new Item({
  title: "Sleep",
});

const read = new Item({
  title: "Read",
});

const dance = new Item({
  title: "Dance",
});

// dance.save();
// insert items to database

// await Item.insertMany([work, sleep, read]);

// ********************************************** delete items from database

// async function deleteAllItem(...title) {
//   try {
//     await Item.deleteMany({ title: { $in: title } });

//     console.log("Items deleted successfully");
//   } catch (error) {
//     console.log(error);
//   } finally {
//     await mongoose.connection.close();
//     console.log("connection closed");
//   }
// }

// deleteAllItem(work.title, sleep.title, read.title);

// **********************************************

// get all items from database
// const todoItems = await Item.find({});

const items = await Item.find({});
if (items.length === 0) {
  await Item.insertMany([work, sleep, read, dance]);
}

let itemList = ["Work", "Sleep", "Read"];
let workList = [];
app.get("/", (req, res) => {
  //
  const options = {
    day: "numeric",
    month: "long",
    weekday: "long",
  };

  async function getItems(item) {
    const items = await item.find({});
    const ItemsArray = items.map((item) => item);
    return ItemsArray;
  }
  getItems(Item).then((items) =>
    res.render("list", { kindOfDay: today, items: items })
  );

  let today = new Date().toLocaleDateString("en", options);
});

app.post("/", (req, res) => {
  let list = req.body.list;

  if (list === "Things") {
    workList.push(req.body.todo);
    res.redirect("/work");
  } else {
    const newItem = new Item({
      title: req.body.todo,
    });
    // save the new item to database
    if (newItem.title === "") {
      console.log("Error: Item title cannot be empty");
    } else {
      newItem.save();
    }

    res.redirect("/");
  }
});

app.post("/delete", (req, res) => {
  console.log(req.body.checkbox);
});

app.get("/work", (req, res) => {
  let workTodo = "Things to do at work";
  res.render("list", { kindOfDay: workTodo, items: workList });
});

app.listen(port, () => console.log("Server started " + port + "!"));
