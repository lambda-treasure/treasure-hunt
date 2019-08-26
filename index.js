// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')

// Main game
async function main() {
  // traverse graph
  let res = await callEndpoint('init', 'get')
  let cooldown = res.cooldown * 1000

  // take all treasures, if available
  if (res.items && res.items.length) {
    for (let item of res.items) {
      setTimeout(async function() {
        res = await callEndpoint('take', 'post', { name: `${item}` })
        cooldown = res.cooldown * 1000
        console.log(res)
      }, cooldown)
    }
  }
}

// Helper functions
async function callEndpoint(endpoint, method, data) {
  try {
    let res = await fetch(
      `https://lambda-treasure-hunt.herokuapp.com/api/adv/${endpoint}/`,
      {
        method: `${method}`,
        headers: { Authorization: `Token ${process.env.TOKEN}` },
        body: JSON.stringify(data)
      }
    )
    res = await res.json()
    console.log(res)
    return res
  } catch (err) {
    console.error(err)
  }
}

main()

// callEndpoint('status', 'post')
// callEndpoint('init', 'get')
// callEndpoint('move', 'post', { direction: 'e' })
// callEndpoint('take', 'post', { name: 'tiny treasure' })
