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

app.get("/", (req, res) => {
  //

  const dayName = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  let day = new Date().getDay();
  let today = dayName[day];
  res.render("list", { kindOfDay: today });
});
app.listen(port, () => console.log("Server started!"));
