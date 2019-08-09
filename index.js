const readline = require('readline-sync')
const robots = {
  text: require('./robots/text.js')
}
//Orquestrador, vai iniciar as funções necessárias e os robôs
async function start(){
   const content = {}

   content.searchTerm = askAndReturnSearchTerm()
   content.prefix = askAndReturnPrefix()

   await robots.text(content)

   //Função para pegar a palavra do usuário
   function askAndReturnSearchTerm() {
     return readline.question("Type a wikipedia search term: ")
   }

   //Função para pegar um prefixo que será o contexto da palavra
   function askAndReturnPrefix() {
     const prefixes = ['who is', 'what is', 'The history of']
     const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
     const selectedPrefixText = prefixes[selectedPrefixIndex]

     return selectedPrefixText
   }

   console.log(content)
}

start()
