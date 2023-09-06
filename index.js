const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000 || process.env.port;
const fs = require("fs");
const axios = require("axios");
const FormData = require('form-data');
let formData = new FormData();

app.use(cors());

let pdfList = [];

fs.readdir('./Archive',(err,files)=>{
  if(err){
    console.log(err);
  }
  else{
    const pdfs = files.map((file,id)=>{
      return({
        id:id,
        name:change(file.split('.')[0].toString()),
        path:"./Archive/"+file
      });
    })
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
  res.json({ message: "Hello world" });
});

app.get("/files", (req, res) => {
  res.json(pdfList);
});


app.post('/send/:id',(req,res)=>{
  const id = req.params.id;
  var pdf = null;
  for(let char of pdfList){
    if(char.id == id){
      pdf = char;
    }
  }
  if(pdf === null){
    res.json({message:"Invalid Id"}).status(401);
    return;
  }
  
  let pdfPath = pdf.path;
  formData.append('files', fs.createReadStream(pdfPath));
  
  
  formData.append('name_space', pdf.name); 
  

  axios.post('https://gpt6-backend-8x4p.onrender.com/create-namespace', formData, {
      headers: {
          ...formData.getHeaders()
      }
  })
  .then((response) => {
      res.json(response.data);
  })
  .catch((error) => {
      res.json(error);
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
