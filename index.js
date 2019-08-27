// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callEndpointAfterCD(endpoint, method, data) {
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
    await sleep(res.cooldown * 1000)
    console.log(res)
    return res
  } catch (err) {
    console.error(err)
  }
}

// Main game
async function main() {
  // traverse graph
//   let current_room = await callEndpointAfterCD('move', 'post', { direction: 'w' })
  let current_room = await callEndpointAfterCD('init', 'get')

  const player = await callEndpointAfterCD('status', 'post')

  // take all treasures, if available
  if (current_room.items.length) {
    for (let item of current_room.items) {
      await callEndpointAfterCD('take', 'post', { name: item })
    }
  }

  // sell all treasures, if player is at a shop
  if (current_room.title === 'Shop' && parseInt(player.encumbrance)) {
    for (let i = 0; i < parseInt(player.encumbrance); i++) {
      await callEndpointAfterCD('sell', 'post', {
        name: 'treasure',
        confirm: 'yes'
      })
    }
  }
}

main()

// callEndpointAfterCD('status', 'post')
// callEndpointAfterCD('init', 'get')
// callEndpointAfterCD('move', 'post', { direction: 'e' })
// callEndpointAfterCD('take', 'post', { name: 'tiny treasure' })
// callEndpointAfterCD('sell', 'post', { name: 'treasure', confirm: 'yes' })
