const express = require('express')
const cons = require('consolidate')
const webpackMiddleware = require('webpack-dev-middleware')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')

const app = express()
const PORT = process.env.PORT || 8000

app.engine('nunjucks', cons.nunjucks)
app.set('view engine', 'nunjucks')
app.set('views', __dirname + '/src')
app.use(express.static('public'))
app.use(webpackMiddleware(webpack(webpackConfig), {
  stats: {
    colors: true
  },
  serverSideRender: true
}))

app.get('/', (req, res) => {
  res.redirect('/editor');
})

app.get('/editor', (req, res) => {
  const assetsByChunkName = res.locals.webpackStats.toJson().assetsByChunkName;

  res.render('editor', {
    js_path: assetsByChunkName.main
  })
})

app.get('/live', (req, res) => {
  res.render('live', {})
})

console.log('Starting server on localhost:' + PORT)

const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs')
server.listen(PORT);

// mqtt to websocket
var tags = {};
var wsClient;

const mqtt = require('mqtt');

const TOPIC = 'tags';
// const client = mqtt.connect('mqtt://192.168.88.48:1883');
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.subscribe(TOPIC);
mqttClient.on('message', (topic, message) => {
  const _message = JSON.parse(message.toString());
  // console.log(message.toString());
  if (_message[0].tagId === '26478') {
    if(_message[0].data === undefined) return;
    // console.log(_message[0]);
    if(typeof _message[0].data.coordinates !== "undefined") {
      tags[_message[0].tagId] = _message[0].data;
      if (wsClient)
        wsClient.emit('pozyx_pos',tags);
    }
  }

  if (_message[0].tagId === '26394') {
    if(_message[0].data === undefined) return;
    // console.log(_message[0]);
    if(typeof _message[0].data.coordinates !== "undefined") {
      tags[_message[0].tagId] = _message[0].data;
      if (wsClient)
        wsClient.emit('pozyx_pos',tags);
    }
  }
});

io.on('connection', function (client) {
  client.on('disconnect', function() {});
  wsClient = client;
});

