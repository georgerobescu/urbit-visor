import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
const app = express();
app.use(express.json());
app.use(cors());
const port = 3333;

const url = "http://127.0.0.1/~initiateAuth";
const key = "0v9c7jl.ehrg6.fn4as.fj1vq.blu98";



app.listen(port, () => {
  console.log(`Urbit Auth server running at port ${port}.`);
});
async function runAuth(req, res, next) {
  console.log(req.get('origin'), "req");
  const opts = {
    method: "POST",
    body: req.body.ship,
    headers: {
      auth: key,
    },
  };
  const r = await fetch(url, opts);
  const j = await r.json();
  console.log(j, "j");
  if (j.token) {
    const filename = `${req.body.ship}.json`;
    fs.writeFile(filename, j.token, "utf8", (err) => {
      console.log(err, "err");
    });
    setTimeout(() => {
      fs.unlink(filename, (err) => {
        console.log(err, "deleted");
      });
    }, 30000);
    res.status(200).json({ status: "ok" });
  } else res.status(400).json(j);
}
function check(req, res, next) {
  console.log(req.body, "check req");
  const filename = `${req.body.ship}.json`;
  fs.readFile(filename, "utf8", (err, data) => {
    console.log(data, "read data");
    if (data === req.body.token) {
      const count = getCount(req.body.ship);
      res.status(200).send({status: "ok", count: count});
    } else res.status(400).send({status: "error", error: "ng"});
  });
}

function getCount(ship) {
  const json = fs.readFileSync("./db.json", "utf8")
  const data = JSON.parse(json)
  const count = data[ship];
  if (!count) {
    const newDb = {};
    newDb[ship] = 1;
    console.log(newDb, "newdb")
    fs.writeFile("./db.json", JSON.stringify(newDb), "utf8", (err) => {
      console.log(err, "error writing to file");
    });
    return 1;
  } else{ 
    data[ship] += 1
    console.log(data, "data")
    fs.writeFile("./db.json", JSON.stringify(data), "utf8", (err) => {
      console.log(err, "error writing to file");
    });
    return count + 1
  }
}

app.post("/init", runAuth);
app.post("/check", check);
