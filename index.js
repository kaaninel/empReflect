const Locker = require("asynclock")();
const {JSONfn} = require("jsonfn");
const IdG = function*(id){
  while(true) 
    for(let i = 0; i < Number.MAX_SAFE_INTEGER; i++) 
      yield `__K${id}_${i}`;
}

module.exports = {
  Send: function(th, fn, id){
    const cId = IdG(id);
    return function(Command, ...Args){
      const Id = cId.next().value;
      fn.call(th, JSONfn.stringify({Id, Command, Args}));
      return Locker.Lock(Id);
    }
  },
  Receive: function(th, fn, Commands){
    return async function(Data){
      Data = JSONfn.parse(Data);
      if(Data.Command && Data.Command in Commands)
        fn.call(th,{Id: Data.Id, Result: await Commands[Data.Command](...Data.Args)});
      else(Data.Result)
        Locker.UnLock(Data.Id, Data.Result);
    }
  }
}