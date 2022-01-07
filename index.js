const express = require('express');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
const { Urls } = require('./models');

app.use(express.json());

app.get('/', async (req, res) => {
  res.send(`<pre>${JSON.stringify(req.headers, null, 2)}</pre>`);
});

app.post('/create', async (req, res) => {
  const { long_url, short, random } = req.body;

  if (validUrl.isUri(long_url)) {
    // url is valid
    let count;
    let short_url;

    if(random===false){
      res.status(400).send(JSON.stringify({
        status: "error",
        message: "Invalid Request"
      }))
    }
    if (!random) {
      //not random
      if (short) {
        // short is there
        count = await Urls.count({ where: { short_url: short } });
        if (count && !random) {
          res.status(409).send({ status: 'Error!', message: 'Already Exists!' });
          return;
        }

        short_url = short;
      } else {
        // nor random neither short
        // default random is true
        short_url = shortid.generate();
        while (await Urls.count({ where: { short_url: short_url } })) {
          short_url = shortid.generate();
        }
      }
    } else {
      short_url = shortid.generate();
      while (await Urls.count({ where: { short_url: short_url } })) {
        short_url = shortid.generate();
      }
    }

    const variable = await Urls.create({
      long_url,
      short_url,
    });

    if (variable) {
      res.status(201).send({
        status: 'success',
        message: req.headers.host + '/' + short_url,
      });
      return;
    } else {
      res.status(500).send({ status: 'Error!', message: 'Unknown' });
      return;
    }
  }

  res.status(400).send({ status: 'Error', message: 'Is Not A Valid Url!' });
  return;
});

app.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!shortid.isValid(id)) {
    res.sendStatus(404);
    return;
  }

  const variable = await Urls.findOne({
    where: {
      short_url: id,
    },
  });

  res.status(302).redirect(variable.long_url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on ${PORT}`);
});
