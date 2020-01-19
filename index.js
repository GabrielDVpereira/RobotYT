const robots = {
  text: require('./robots/text.js'),
  input: require('./robots/input.js'),
  state: require('./robots/state.js'),
  image: require('./robots/image.js')
}
//Orquestrador, vai iniciar as funções necessárias e os robôs
async function start(){

   // robots.input()
   // await robots.text()
   await robots.image()
   console.dir(robots.state.load(), {depth: null});
}

start()
