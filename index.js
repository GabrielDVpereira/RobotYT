const robots = {
  text: require('./robots/text.js'),
  input: require('./robots/input.js'),
  state: require('./robots/state.js')
}
//Orquestrador, vai iniciar as funções necessárias e os robôs
async function start(){

   robots.input()
   await robots.text()
   console.dir(robots.state.load(), {depth: null});
}

start()
