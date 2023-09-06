const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000 || process.env.PRT;
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
let formData = new FormData();
const path = require('path')
app.use(cors());
app.use(express.json());

let pdfList = [];

fs.readdir("./Archive", (err, files) => {
  if (err) {
    console.log(err);
  } else {
    const pdfs = files.map((file, id) => {
      return {
        id: id,
        name: change(file.split(".")[0].toString()),
        path: "./Archive/" + file,
      };
    });
    pdfList = [...pdfs];
  }
});

// function to change the name of pdf to pass on as namespace
function change(name) {
  let newName = "";
  for (let char of name) {
    if (char === " ") {
      newName += "_";
    } else {
      newName += char;
    }
  }
  return newName;
}

app.get("/", (req, res) => {
  res.json({ message: "App is up and running" });
});

app.get("/files", (req, res) => {
  res.json(pdfList);
});

app.get("/pdf/:id", (req, res) => {
  const id = req.params.id;
  for (let char of pdfList) {
    if (char.id == id) {
      const filePath = path.join(__dirname , char.path);
      return res.sendFile(filePath);
    }
  }
  res.status(401).json({"message":"Invalid params"});
});

app.post("/send/:id", (req, res) => {
  const id = req.params.id;
  var pdf = null;
  for (let char of pdfList) {
    if (char.id == id) {
      pdf = char;
    }
  }
  if (pdf === null) {
    res.json({ message: "Invalid Id" }).status(401);
    return;
  }

  let pdfPath = pdf.path;
  formData.append("files", fs.createReadStream(pdfPath));

  formData.append("name_space", pdf.name);

  axios
    .post("https://gpt6-backend.onrender.com/create-namespace", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      res.json(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
