let http = require('http')
let request = require('request')
let argv = require('yargs').argv
let fs = require('fs')
let logStream = argv.logfile ? fs.createWriteStream(argv.logfile) : process.stdout

let localhost = '127.0.0.1'
let scheme = 'http://'
let host = argv.host || localhost
let port = argv.port || (host === localhost ? 8000 : 80)
let destinationUrl = scheme + host + ':' + port

let echoServer = http.createServer((req,res) => {
  console.log('echoServer\n');
  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
  logStream.write(JSON.stringify(req.headers) + '\n')
  req.pipe(res)
})
echoServer.listen(8000)
logStream.write('proxy server listening at 172.0.0.1:8000\n')


let proxyServer = http.createServer((req,res) => {
  logStream.write('proxyServer\n');
  logStream.write(JSON.stringify(req.headers) + '\n')

  let url = destinationUrl
  if(req.headers['x-destination-url']){
    url = 'http://' + req.headers['x-destination-url']
  }

  let options = {
    url : url + req.url
  }
  outboundResponse = request(options)
  logStream.write(JSON.stringify(outboundResponse.headers))
  outboundResponse.pipe(process.stdout)
  outboundResponse.pipe(res)
  //req.pipe(request(options)).pipe(res)

})
proxyServer.listen(9000)
logStream.write('proxy server listening at 172.0.0.1:9000\n')
