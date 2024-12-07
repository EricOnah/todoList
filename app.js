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

let itemList = ["Work", "Sleep", "Read"];
let workList = [];
app.get("/", (req, res) => {
  //
  const options = {
    day: "numeric",
    month: "long",
    weekday: "long",
  };
  let today = new Date().toLocaleDateString("en", options);
  console.log();
  res.render("list", { kindOfDay: today, items: itemList });
});

app.post("/", (req, res) => {
  let list = req.body.list;

  if (list === "Things") {
    workList.push(req.body.todo);
    res.redirect("/work");
  } else {
    itemList.push(req.body.todo);
    res.redirect("/");
  }
});

app.get("/work", (req, res) => {
  let workTodo = "Things to do at work";
  res.render("list", { kindOfDay: workTodo, items: workList });
});

app.listen(port, () => console.log("Server started " + port + "!"));
