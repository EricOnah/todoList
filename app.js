import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = 5000;

// use express to handle form data and JSON requests(request body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// defining __dirname to extract directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// use express to render statics from the root folder
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

app.listen(port, () => console.log(`Server started at port ${port}!`));
