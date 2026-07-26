require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const CUSTOM_OBJECT_TYPE = process.env.CUSTOM_OBJECT_TYPE;
const HUBSPOT_ACCESS_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

// GET / - homepage: fetch all custom object records and render table
app.get('/', async (req, res) => {
      try {
              const response = await axios.get(
                        `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`,
                  {
                              params: { properties: 'name,game,ability', limit: 100 },
                              headers: {
                                            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                                            'Content-Type': 'application/json',
                              },
                  }
                      );
              const characters = response.data.results;
              res.render('homepage', {
                        title: 'Video Game Characters | Integrating With HubSpot I Practicum',
                        characters,
              });
      } catch (error) {
              console.error('Error fetching custom objects:', error.response?.data || error.message);
              res.status(500).send('Error fetching records from HubSpot.');
      }
});

// GET /update-cobj - render the form to add a new character
app.get('/update-cobj', (req, res) => {
      res.render('updates', {
              title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
      });
});

// POST /update-cobj - create a new CRM record from form data, then redirect home
app.post('/update-cobj', async (req, res) => {
      const { name, game, ability } = req.body;
      try {
              await axios.post(
                        `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`,
                  { properties: { name, game, ability } },
                  {
                              headers: {
                                            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                                            'Content-Type': 'application/json',
                              },
                  }
                      );
              res.redirect('/');
      } catch (error) {
              console.error('Error creating custom object:', error.response?.data || error.message);
              res.status(500).send('Error creating record in HubSpot.');
      }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
