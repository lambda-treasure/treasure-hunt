// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')

const callEndpoint = (endpoint, method, data) => {
  fetch(`https://lambda-treasure-hunt.herokuapp.com/api/adv/${endpoint}/`, {
    method: `${method}`,
    headers: { Authorization: `Token ${process.env.TOKEN}` },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => console.log('\n', data))
    .catch(error => console.error(error))
}

callEndpoint('init', 'get')
callEndpoint('status', 'post')
callEndpoint('move', 'post', { direction: 'e' })
