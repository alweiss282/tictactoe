const { Socket } = require("dgram")
const express = require("express")
const http = require('http')
const app = express()
const server = http.createServer(app)
const path = require('path')
const { Server } = require('socket.io')
const io = new Server(server)
const { readFileSync, writeFileSync } = require('fs')
const cheerio = require('cheerio')
const $ = cheerio.load(readFileSync(path.join(__dirname, './template/index.html')))
const template = $
writeFileSync('./public/index.html', template.root().html())
let num_users = 0
let num_games = 0

app.get('/game/:game_id', (req, res) => {
  res.write("game")
  res.end()
})


app.use(express.static(path.join(__dirname, './public')))

io.on('connection', (socket) => {
  num_users += 1
  io.emit('num users updated', num_users)

  socket.on('disconnect', () => {
    num_users -= 1
    io.emit('num users updated', num_users)
  })

  socket.on('entering game', () => {
    num_games += 1
    socket.emit('game entered', num_games)
  })

  socket.on('add game', (element) => {
    io.emit('add game', element)
    $("#dropdown-container").append(element)
    writeFileSync('./public/index.html', $.root().html())
  })
})

server.listen(8080, () => {
  console.log('server is listening to port 8080...')
})