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
      `https://lambda-treasure-hunt.herokuapp.com/api/${endpoint}/`,
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

function the_other_side(direction_traveled) {
  if (direction_traveled === 'n') {
    return 's'
  } else if (direction_traveled === 's') {
    return 'n'
  } else if (direction_traveled === 'e') {
    return 'w'
  } else if (direction_traveled === 'w') {
    return 'e'
  }
}

// Main game
async function main() {
  let traveled = []
  let visited = {}
  let unexplored = []

  console.log(Object.keys(visited).length + '-----------------------')
  while (Object.keys(visited).length <= 500) {
    let current_room = await callEndpointAfterCD('adv/init', 'get')

    let this_room_id = current_room.room_id
    if (traveled[traveled.length - 1] != this_room_id) {
      traveled.push(this_room_id)
    }

    console.log('THIS IS THE ROUTE YOU ARE WORKING ON!!!!!' + traveled)
    if (!(this_room_id in visited)) {
      visited[this_room_id] = {}
      console.log(visited)

      for (let i = 0; i < current_room.exits.length; i++) {
        visited[this_room_id][current_room.exits[i]] = '?'
      }
    }

    /*
    - If each exit directions in the current room is '?' (i.e. unexplored), add it to unexplored array
    - Then, randomly select one in the next step
    */

    let current_exits = visited[this_room_id]
    console.log(
      '------ Current exits for this room are: ' + JSON.stringify(current_exits)
    )

    for (x in visited[this_room_id]) {
      if (visited[this_room_id][x] === '?') {
        unexplored.push(x)
      }
    }
    console.log('THIS IS THE UNEXPLORED!!!!!  ' + unexplored)

    if (unexplored.length) {
      let direction = unexplored[Math.floor(Math.random() * unexplored.length)]

      // travel in a random direction
      let new_current_room = await callEndpointAfterCD('adv/move', 'post', {
        direction: direction
      })

      let new_room_id = new_current_room.room_id
      console.log('=======> NEW ROOM ID IS:  ' + new_room_id + '<===========')

      visited[this_room_id][direction] = new_room_id
      if (!(new_room_id in visited)) {
        visited[new_room_id] = {}

        for (let i = 0; i < new_current_room.exits.length; i++) {
          visited[new_room_id][new_current_room.exits[i]] = '?'
        }
      }

      let op_dir = the_other_side(direction)
      visited[new_room_id][op_dir] = this_room_id
    } else {
      /*
      - Generate a list of directions to get to the nearest unexplored room using BFS
      - Loop through and send the player in those directions in order
      */

      traveled.pop()
      let backwards_movement = traveled[traveled.length - 1]

      for (x in visited[this_room_id]) {
        if (visited[this_room_id][x] === backwards_movement) {
          await callEndpointAfterCD('adv/move', 'post', {
            direction: x,
            next_room_id: JSON.stringify(backwards_movement)
          })
          console.log(
            '===============> YOU ARE A VERY WISE TRAVELLER INDEED! <======================'
          )
        }
      }
    }
    console.log('The Visited Object is:  ' + JSON.stringify(visited))
  }

  // traverse graph
  //   let current_room = await callEndpointAfterCD('move', 'post', { direction: 'w' })
  // let current_room = await callEndpointAfterCD('adv/init', 'get')

  // const player = await callEndpointAfterCD('adv/status', 'post')

  // take all treasures, if available
  // if (current_room.items.length) {
  //   for (let item of current_room.items) {
  //     await callEndpointAfterCD('adv/take', 'post', { name: item })
  //   }
  // }

  // sell all treasures, if player is at a shop
  // if (current_room.title === 'Shop') {
  //   for (let i = 0; i < parseInt(player.encumbrance); i++) {
  //     await callEndpointAfterCD('adv/sell', 'post', {
  //       name: 'treasure',
  //       confirm: 'yes'
  //     })
  //   }
  // }

  // purchase new name, if player is at Pirate Ry's and has at least 1000 gold
  // if (
  //   current_room.title.includes('Pirate Ry') &&
  //   parseInt(player.gold) >= 1000
  // ) {
  //   await callEndpointAfterCD('adv/change_name', 'post', {
  //     name: process.env.NAME
  //   })
  // }
}

main()