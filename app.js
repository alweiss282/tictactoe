// import dependencies
const { Socket } = require("dgram")
const express = require("express")
const http = require('http')
const path = require('path')
const { readFileSync, writeFileSync } = require('fs')
const { Server } = require('socket.io')
const cheerio = require('cheerio')

// create server
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// load template index.html into public folder
const $ = cheerio.load(readFileSync(path.join(__dirname, './template/index.html')))
const template = $
writeFileSync(path.join(__dirname, './public/index.html'), template.root().html())

// start with no users or games
let num_users = 0
let num_games = 0

app.get('/game/:game_id', (req, res) => {
  // TODO: Implement game logic
  res.write("game")
  res.end()
})

app.use(express.static(path.join(__dirname, './public')))

io.on('connection', (socket) => {

  num_users += 1
  socket.on('disconnect', () => {
    num_users -= 1
  })

  socket.on('entering game', () => {
    num_games += 1
    socket.emit('game entered', num_games)
  })

  socket.on('add game', (element) => {
    io.emit('add game', element)
    // Add link to newly-created game to dropdown menu and push new HTML to public
    $("#dropdown-container").append(element)
    $("#existinggame").prop("class", "active-button")
    writeFileSync(path.join(__dirname, './public/index.html'), $.root().html())
  })
})

server.listen(8080, () => {
  console.log('server is listening to port 8080...')
})