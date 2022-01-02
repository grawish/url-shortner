const app = require('express')();
const bodyparser = require('body-parser');
const validUrl = require('valid-url');
const shortid = require('shortid');
const { Urls } = require('./models');

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('/', async (req, res) => {
  res.send(`<pre>${JSON.stringify(req.headers, null, 2)}</pre>`);
});

app.post('/create', async (req, res) => {
  const { long_url, short, random } = req.body;

  if (!validUrl.isUri(long_url)) {
    res.send({ status: 'Error', message: 'Is Not A Valid Url!' });
    return;
  }

  const count = await Urls.count({ where: { short_url: short } });

  if (count && !random) {
    res.send({ status: 'Error!', message: 'Already Exists!' });
    return;
  }

  let short_url;

  if (random) {
    short_url = shortid.generate();
    while (await Urls.count({ where: { short_url: short_url } })) {
      short_url = shortid.generate();
    }
  } else short_url = short;

  const variable = await Urls.create({
    long_url,
    short_url,
  });

  if (variable) {
    res.send({
      status: 'success',
      message: req.headers.host + '/' + short_url,
    });
  } else {
    res.send({ status: 'Error!', message: 'Unknown' });
  }
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

  res.redirect(variable.long_url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on ${PORT}`);
});
