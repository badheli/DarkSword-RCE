// 用 Node.js 内置模块启动一个简单 HTTP 服务器
// 运行方式：node server.js

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000

const mimeTypes = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
}

const server = http.createServer((req, res) => {
  // 默认访问 index.html
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url)
  const ext = path.extname(filePath)

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log(`服务器已启动，请在浏览器打开：http://localhost:${PORT}`)
})
