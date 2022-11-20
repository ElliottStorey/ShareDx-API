const express = require('express');
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());

const JSONdb = require('simple-json-db');
const users = new JSONdb('./users.json');

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (!users.has(username)) {
    res.sendStatus(401);
  } else {
    if (users.get(username).password == password) {
      res.send('User Exists');
    } else {
      res.sendStatus(401);
    }
  }
});

app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const diagnoses = req.body.diagnoses;
  const description = req.body.description;
  const sex = req.body.sex;

  let info = {
    password: password,
    diagnoses: diagnoses,
    description: description,
    sex: sex,
    score: 0
  }
  if (users.has(username)) {
    res.status(400).send('User Exists')
  } else {
    users.set(username, info);
    res.sendStatus(200)
  }
});

app.post('/userinfo', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (users.get(username).password == password) {
    res.send(users.get(username));
  };
});

const connects = new JSONdb('./connects.json');

app.post('/connectSearch', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  let matches = [];

  if (users.get(username).password == password) {
    connects.set(username, true);
    console.log(`${username} Connected`);
    for (const user in connects.JSON()) {
      users.get(user).diagnoses.forEach((diagnosis) => {
        if (Object.values(users.get(username).diagnoses).includes(diagnosis)) {
          if (matches.includes(user) === false && user !== username) matches.push(diagnosis);
        }
      })
    }
  }
  res.send(matches);
});

const groups = new JSONdb('./groups.json');

app.post('/sendMessage', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const diagnosisGroup = req.body.diagnosisGroup;
  const message = req.body.message;
  if (users.get(username).password == password) {
    const messages = groups.get(diagnosisGroup);
    if (messages) {
      groups.set(diagnosisGroup, [...messages, {id: username, msg: message}]);
    } else {
      groups.set(diagnosisGroup, [{id: username, msg: message}]);
    }
    res.send(groups.get(diagnosisGroup));
  };
});

app.post('/getMessages', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const diagnosisGroup = req.body.diagnosisGroup;
  const message = req.body.message;
  if (users.get(username).password == password) {
    const messages = groups.get(diagnosisGroup);
    res.send(messages);
  };
})

app.listen(3000, () => {
  console.log('Server Started');
});