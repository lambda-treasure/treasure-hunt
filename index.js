// Run `node index.js` in your terminal

require('dotenv').config()
const fetch = require('node-fetch')

// Helper functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function Queue() {
  this.queue = [];
  this.enqueue = function (value) {
    return this.queue.append(value)
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
  var bfs_visited = {};
  var q = new Queue();
  var path = [room];
  q.enqueue([room])
  while (q.size()) {
    var placeholder = q.queue;
    var v = placeholder[0];
    if (v == '?') {
      path = placeholder.slice(1);
      break
    }
    if (!(v in bfs_visited)) {
      bfs_visited.append(v);
      var keys = Object.keys(dictionary[v])
      for (let key of keys) {
        var node = dictionary[v][key];
        var c = placeholder.slice();
        c.unshift(node)
        q.enqueue(c)
      };
    };
  };
  var directions = [];
  while (path.length > 1) {
    var location = path.pop();
    var new_keys = Object.keys(dictionary[location]);
    for (let key of new_keys) {
      if (dictionary[location][key] == path[path.length - 1]) {
        directions.append(key);
      }
    };
  };
  return directions

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

var traversalPath = []

// Main game
async function main() {
  var visited = {}

  while (visited.length < 500) {
    // THIS WILL NEED TO BE WORKED ON
    //------------------------------------------------------------
    //NEED TO GET THE CURRENT ROOM INFORMATION 
    var this_room_id = current_room.room_id;
    if (!(this_room_id in visited)) {
      visited[this_room_id] = {};
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
    var unexplored = [];
    //-----------------------------------------------------
    // FOR EACH OF THE EXIT DIRECTIONS IN THE CURRENT ROOM, IF IT IS A '?' (meaning unexplored) ADD IT TO THE UNEXPLORED ARRAY.  
    // WE WILL RANDOMLY SELECT ONE OF THESE IN THE NEXT STEP.
    /* THIS IS THE PYTHON VERSION
     unexplored = [direction for direction in visited[room]
                if visited[room][direction] == '?']  */
    if (unexplored.length > 0) {
      var direction = unexplored[(Math.floor(Math.random() * unexplored.length))];
      //-----------------------------------------------------
      // REQUEST TO TRAVEL IN THAT DIRECTION
      player.travel(direction);
      traversalPath.append(direction);
      //-----------------------------------------------------
      // need to get the new current_room_id
      var new_room_id = current_room.room_id;
      visited[this_room_id][direction] = new_room_id;
      if (!(new_room_id in visited)) {
        visited[this_room_id] = {};
        //-----------------------------------------------------
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
      var op_dir = the_other_side(direction)
      visited[new_room_id][op_dir] = this_room_id
    }
    else {
      // generate a list of directions to get to the nearest unexplored node using a BFS, 
      // loop through and send the player in those directions in order.

      var directions = bfs(visited, this_room_id)
      traversalPath = traversalPath + directions

      directions.forEach(
        //----------------------------------------------------------------
        // MAKE A REQUEST AND TRAVEL IN EACH OF THE DIRECTIONS

      )
    }
  }






  // traverse graph
  //   let current_room = await callEndpointAfterCD('move', 'post', { direction: 'w' })
  let current_room = await callEndpointAfterCD('adv/init', 'get')

  const player = await callEndpointAfterCD('adv/status', 'post')

  // take all treasures, if available
  if (current_room.items.length) {
    for (let item of current_room.items) {
      await callEndpointAfterCD('adv/take', 'post', { name: item })
    }
  }

  // sell all treasures, if player is at a shop
  if (current_room.title === 'Shop') {
    for (let i = 0; i < parseInt(player.encumbrance); i++) {
      await callEndpointAfterCD('adv/sell', 'post', {
        name: 'treasure',
        confirm: 'yes'
      })
    }
  }

   // purchase new name, if player is at Pirate Ry's and has at least 1000 gold
   if (
    current_room.title.includes('Pirate Ry') &&
    parseInt(player.gold) >= 1000
  ) {
    await callEndpointAfterCD('adv/change_name', 'post', { name: 'divya-ben' })
  }
}

main()

// callEndpointAfterCD('adv/status', 'post')
// callEndpointAfterCD('adv/init', 'get')
// callEndpointAfterCD('adv/move', 'post', { direction: 'e' })
// callEndpointAfterCD('adv/take', 'post', { name: 'tiny treasure' })
// callEndpointAfterCD('adv/sell', 'post', { name: 'treasure', confirm: 'yes' })
