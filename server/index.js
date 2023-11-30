const express = require('express')
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname, '/version-1')))

app.use((req, res) => {
    res.status(404)
    res.send(`<h1>Error 404: Resource not found<h1>`)
})

app.listen(1000, () => console.log("Web Server listening on port 1000!"))