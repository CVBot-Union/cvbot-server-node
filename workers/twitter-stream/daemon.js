require('../../starups')
const childProcess = require('child_process');
const express = require('express')
const app = express();
let child = childProcess.fork(`${__dirname}/worker`);

app.get('/', async(req, res) => {
  res.send({
    killed: child.killed
  });
});

app.patch('/', async(req, res) => {
  child.kill('SIGTERM');
  res.send({
    killed: child.killed
  });
});

app.post('/', async(req, res) => {
  if(child.killed){
    child = childProcess.fork(`${__dirname}/worker`);
    res.send({
      killed: child.killed
    });
  }else{
    res.send({
      killed: false,
      error: "process not killed!"
    });
  }
});

child.on('message', (message) =>{
  console.log(message);
})

app.listen(process.env.WORKER_PORT);
