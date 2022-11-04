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
let users = new Set()
let num_games = 0

app.get('/game/:game_id', (req, res) => {
  // TODO: Implement game logic
  res.write("game " + req.params.game_id)
  res.end()
})

app.use(express.static(path.join(__dirname, './public')))

io.on('connection', (socket) => {
  let username
  socket.on('new user', (name) => {
    if (!(users.has(name))) {
      users.add(name)
      username = name
      socket.emit('name processed', false)
    } else {
      socket.emit('name processed', true)
    }
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

  socket.on('remove option', (id) => {
    console.log(id)
    $(`#${id}`).remove()
    writeFileSync(path.join(__dirname, './public/index.html'), $.root().html())
  })
})

server.listen(8080, () => {
  console.log('server is listening to port 8080...')
})