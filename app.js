import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { mongoose, connect, Schema, model } from "mongoose";
import dotenv from "dotenv";

// import { serverless } from "serverless-http";

const app = express();
const port = process.env.PORT || 3000;

// configure .env

dotenv.config();

// set EJS as template engine

// app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

// set the views directory

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// **middleware to manually set the header content of my css to text/css Not needed bc express.static() does it
// Automatically

// app.use((req, res, next) => {
//   if (req.url.endsWith(".css")) {
//     res.setHeader("Content-Type", "text/css");
//   }
//   next();
// });

// mongodb connection

// const url = "mongodb://0.0.0.0:27017/todolistDB";

const url = process.env.MONGODB_URI;
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

// create a schema for the custom lists
const customListSchema = new Schema({
  name: String,
  items: [todoItemSchema],
});

// create model for custom lists
const List = model("List", customListSchema);

app.get("/", async (req, res) => {
  //
  const options = {
    day: "numeric",
    month: "long",
    weekday: "long",
  };
  let today = new Date().toLocaleDateString("en", options);

  const items = await Item.find({});
  const itemsArray = items.map((item) => item);
  res.render("list", { kindOfDay: today, items: itemsArray });
});

app.post("/", async (req, res) => {
  const options = {
    // day: "numeric",
    // month: "long",
    weekday: "long",
  };
  let today = new Date().toLocaleDateString("en", options);
  const queryVar = today + ",";
  const listName = req.body.list;
  const newItem = new Item({
    title: req.body.todo,
  });
  if (queryVar === req.body.list) {
    // get the new item from the form
    // save the new item to database if not empty
    if (newItem.title === "") {
      console.log("Error: Item title cannot be empty");
    } else {
      newItem.save();
      res.redirect("/");
    }
  } else {
    const foundList = await List.findOne({ name: req.body.list });
    foundList.items.push(newItem);
    await foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;

  const checked = await List.find(
    { "items._id": new mongoose.Types.ObjectId(checkedItemId) },
    { "items.$": 1 }
  ).exec();

  try {
    if (checked.length > 0) {
      const ListName = await List.findById(checked[0]._id);
      const listId = ListName._id;
      const itemId = checked[0].items[0]._id;

      await List.updateOne(
        { _id: new mongoose.Types.ObjectId(listId) },
        { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } }
      ).exec();
      res.redirect("/" + ListName.name);
    } else {
      try {
        // let item = await Item.findById(checkedItemId);
        await Item.findByIdAndDelete(checkedItemId);
        res.redirect("/");
        // console.log(`Item ${item.title} deleted successfully`);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }

  // find the item in the database
});

// create model for custom lists

app.get("/:customListName", async (req, res) => {
  if (req.params.customListName === "favicon.ico") {
    return res.status(204).end();
  }
  // res.render("list", { kindOfDay: workTodo, items: workList });
  let customListName = req.params.customListName;
  console.log(req.params);
  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      // create a new list
      const list = new List({
        name: customListName,
        items: [work, sleep, read],
      });
      await list.save();
      res.redirect("/" + customListName);

      console.log("List not found " + customListName);
    } else {
      // show an existing list
      res.render("list", {
        kindOfDay: foundList.name,
        items: foundList.items,
      });
      console.log("List found " + customListName);
    }
  } catch (error) {
    console.log(error);
  }
});

// app.get("/:customListName", async (req, res) => {
//   if (req.params.customListName === "favicon.ico") {
//     return res.status(204).end();
//   }

//   let customListName = req.params.customListName;
//   console.log(req.params);

//   try {
//     const foundList = await List.findOne({ name: customListName });
//     if (!foundList) {
//       // Ensure work, sleep, and read are defined or replace with dynamic items
//       const work = { name: "Work" };
//       const sleep = { name: "Sleep" };
//       const read = { name: "Read" };

//       const list = new List({
//         name: customListName,
//         items: [work, sleep, read],
//       });
//       await list.save();
//       console.log("List not found " + customListName);
//       return res.redirect("/" + customListName);
//     } else {
//       console.log("List found " + customListName);
//       return res.render("list", {
//         kindOfDay: foundList.name,
//         items: foundList.items,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send("Internal Server Error");
//   }
// });

app.post("/delete-todo", async (req, res) => {
  const todoId = req.body.deleteTodo;
  const todoName = await List.findOne({ name: todoId });
  if (todoName) {
    await List.deleteOne({ name: todoId });
    res.redirect("/");
  }
});

// app.listen(port, () => console.log("Server started " + port + "!"));

export default app;
