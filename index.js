// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')


const callEndpoint = (endpoint, method) => {
  fetch(`https://lambda-treasure-hunt.herokuapp.com/api/adv/${endpoint}/`, {
    method: `${method}`,
    headers: { Authorization: `Token ${process.env.TOKEN}` }
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(error => console.error(error))
}

callEndpoint('status', 'post')
