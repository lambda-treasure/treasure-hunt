// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class Queue {
  constructor() {
    this.queue = [];
    this.enqueue = function (value) {
      return this.queue.push(value)
    };
    this.dequeue = function () {
      if (this.queue.length > 0) {
        return this.queue.shift()
      }
      else {
        return None
      }
    }
    this.size = function () {
      return this.queue.length
    }
  }
};
function enqueue(queue, value) {
  return queue.push(value)
};
function dequeue(queue) {
  if (queue.length > 0) {
    return queue.shift()
  }
  else {
    return None
  }
};
function size(queue) {
  return queue.length
};

function the_other_side(direction_traveled) {
  if (direction_traveled == 'n') {
    return 's'
  }
  else if (direction_traveled == 's') {
    return 'n'
  }
  else if (direction_traveled == 'e') {
    return 'w'
  }
  else if (direction_traveled == 'w') {
    return 'e'
  }
}

function bfs(dictionary, room) {
  let bfs_visited = new Set();
  // let q = new Queue();
  queue = [];
  let path = [room];
  enqueue(queue, [room])
  while (size(queue)) {
    let placeholder = queue;
    let v = placeholder[0];
    if (v == '?') {
      path = placeholder.slice(1);
      break
    }
    if (!(v in bfs_visited)) {
      bfs_visited.add(v);
      let keys = Object.keys(dictionary[v])
      for (let key of keys) {
        let node = dictionary[v][key];
        let c = placeholder.slice();
        c.unshift(node)
        enqueue(queue, c)
      };
    };
  };
  let directions = [];
  while (path.length > 1) {
    let location = path.pop();
    let new_keys = Object.keys(dictionary[location]);
    for (let key of new_keys) {
      if (dictionary[location][key] == path[path.length - 1]) {
        directions.push(key);
      }
    };
  };
  return directions

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
  let traveled = [];
  let visited = {}
  console.log(Object.keys(visited).length + "-----------------------")
  while (Object.keys(visited).length < 500) {
    let current_room = await callEndpointAfterCD('init', 'get')

    let this_room_id = current_room.room_id;
    traveled.push(this_room_id);
    console.log("THIS IS THE ROUTE YOU ARE WORKING ON!!!!!" + traveled);
    if (!(this_room_id in visited)) {
      visited[this_room_id] = {};
      console.log(visited);
      //----------------------------------------------------------
      // NOT SURE IF THIS WILL SET UP THE CORRECT KEY: VALUE PAIR
      /* THIS IS THE PYTHON VERSION:  AFTER IS MY ATTEMPT TO CONVERT TO JAVASCRIPT
      if room not in visited:
        visited[room] = {
            direction: '?' for direction in player.currentRoom.getExits()}
      */

      for (i = 0; i < current_room.exits.length; i++) {
        visited[this_room_id][current_room.exits[i]] = '?'
      };
    };

    let unexplored = [];
    //-----------------------------------------------------
    // FOR EACH OF THE EXIT DIRECTIONS IN THE CURRENT ROOM, IF IT IS A '?' (meaning unexplored) ADD IT TO THE UNEXPLORED ARRAY.  
    // WE WILL RANDOMLY SELECT ONE OF THESE IN THE NEXT STEP.
    /* THIS IS THE PYTHON VERSION
     unexplored = [direction for direction in visited[room]
                if visited[room][direction] == '?']  */
    let current_exits = visited[this_room_id];
    console.log("------ Current exits for this room are: " + JSON.stringify(current_exits));

    for (x in visited[this_room_id]) {
      if (visited[this_room_id][x] == '?') {
        unexplored.push(x);
      };
    };
    console.log("THIS IS THE UNEXPLORED!!!!!  " + unexplored);



    if (unexplored.length > 0) {
      let direction = unexplored[(Math.floor(Math.random() * unexplored.length))];
      //-----------------------------------------------------
      // REQUEST TO TRAVEL IN THAT DIRECTION
      let new_current_room = await callEndpointAfterCD('move', 'post', { "direction": direction })


      //-----------------------------------------------------
      // need to get the new new_current_room_id
      let new_room_id = new_current_room.room_id;
      console.log("=======> NEW ROOM ID IS:  " + new_room_id + "<===========")
      visited[this_room_id][direction] = new_room_id;
      if (!(new_room_id in visited)) {
        visited[new_room_id] = {};
        //-----------------------------------------------------
        // NOT SURE IF THIS WILL SET UP THE CORRECT KEY: VALUE PAIR
        /* THIS IS THE PYTHON VERSION:  AFTER IS MY ATTEMPT TO CONVERT TO JAVASCRIPT
        if room not in visited:
          visited[room] = {
              direction: '?' for direction in player.currentRoom.getExits()}
        */

        for (i = 0; i < new_current_room.exits.length; i++) {
          visited[new_room_id][new_current_room.exits[i]] = '?'
        };
      };
      let op_dir = the_other_side(direction)
      visited[new_room_id][op_dir] = this_room_id
    }
    else {
      // generate a list of directions to get to the nearest unexplored node using a BFS, 
      // loop through and send the player in those directions in order.

      traveled.pop()
      let backwards_movement = traveled[traveled.length - 1]

      for (x in visited[this_room_id]) {
        if (visited[this_room_id][x] == backwards_movement) {
          await callEndpointAfterCD('move', 'post', { "direction": x, "next_room_id": backwards_movement })
          console.log("===============> YOU ARE A VERY WISE TRAVELLER INDEED! <======================")
        }
      };
    };
    console.log("The Visited Object is: " + JSON.stringify(visited));
  }






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
