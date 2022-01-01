const app = require('express')()
const bodyparser = require('body-parser')
const { Urls } = require('./models')

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.post('/create', async (req, res) => {
  const { long_url } = req.body

  const short_url = (Math.random() + 1).toString(36).substring(7)

  console.log(`binding ${short_url} to ${long_url}`)

  const variable = await Urls.create({
    long_url,
    short_url,
  })

  variable?res.send('https://short.grawish.com/'+short_url):res.send("Mar jaao nahi bana !")
})

app.get('/:id', async (req, res) => {
  const { id } = req.params;
  const variable = await Urls.findOne({
    where: {
    short_url: id
  }
  })
  console.log(variable)
  res.redirect(variable.long_url)

})

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on ${PORT}`)
})
