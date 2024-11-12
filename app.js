import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = 3000;

// set EJS as template engine

app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(express.static(__dirname));

let itemList = ["Work", "Sleep", "Read"];

app.get("/", (req, res) => {
  //
  const options = {
    day: "numeric",
    month: "long",
    weekday: "long",
  };
  let today = new Date().toLocaleDateString("en", options);
  res.render("list", { kindOfDay: today, items: itemList });
});

app.post("/", (req, res) => {
  itemList.push(req.body.todo);
  console.log(itemList);
  res.redirect("/");
});
app.listen(port, () => console.log("Server started!"));
