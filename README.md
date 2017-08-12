# empReflect
Async Server/Client Command Interface. Designed for Empati.

```js
  Send(this, SenderFunction, Id) // Generates function for sending commands 
  // this -> this object which will be binded to SenderFunction
  // SenderFunction -> Takes Command object and sends to receiver. If can't transport object should stringify first. 
  // Id -> Uniq id for generated function. Used for distinguishing owner of messages. 

  // Return: function(Command, ...Args) {...} // First Param which function in receiver will triggered and rest of the parameters will be given as arguments to triggered function.
```

```js
  Receive(this, SenderFunction, Commands) // Generates function for running received commands and send results back 
  // this -> this object which will be binded to SenderFunction
  // SenderFunction -> Takes Command object and sends to receiver. If can't transport object should stringify first. 
  // Commands -> An object full of functions which will triggered when you get a command.

  // Return: function(CommandObj) {...} // Generated function takes a Command Object sent by Send function and 
  // after processing returns the result via sender function 
```


Example Usage
```js
var empReflect = require("emp-reflect")

const cluster = require("cluster");

const main = async function() {
  if(cluster.isMaster){
    for(let i = 0; i < 4; i++){
      const worker = cluster.fork();
      worker.Send = empReflect.Send(worker, worker.send, worker.id);
      worker.on("message", empReflect.Receive(worker, worker.send, {
        C1: () => 2,
        C2: async F => await worker.Send(F, "dummy", "args")
      }));
    }
  }else{
    process.Send = empReflect.Send(process, process.send, cluster.worker.id);
    process.on("message", empReflect.Receive(process, process.send, {
      Join: (...args) => args.join(' ')
    }));
    const C1 = await process.Send("C1");
    const C2 = await process.Send("C2", "Join");

    console.log(`Worker ${cluster.worker.id} | `, C1, C2);
  }
}

main();
```