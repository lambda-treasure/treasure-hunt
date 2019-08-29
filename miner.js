require('dotenv').config()
const fetch = require('node-fetch')
const shajs = require('sha.js')

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
    let status = res.status
    let obj = await res.json()
    let result = { ...obj, status }
    await sleep(obj.cooldown * 1000)
    console.log(result)
    return result
  } catch (err) {
    console.error(err)
  }
}

function validate_proof(last_proof, proof, difficulty) {
  let hash = shajs('sha256')
    .update(`${last_proof}${proof}`)
    .digest('hex')
  return hash.substring(0, difficulty) === '0'.repeat(difficulty)
}

// Miner
async function main() {
  while (true) {
    let last_block = await callEndpointAfterCD('bc/last_proof', 'get')
    let last_proof = last_block.proof
    let difficulty = last_block.difficulty
    let proof = last_proof
    let is_valid = false

    console.log(`🔍 Validating proof`)
    while (!is_valid) {
      is_valid = validate_proof(last_proof, proof, difficulty)
      proof += 1
    }
    console.log(`✅ Finished validating. Proof is ${proof}`)

    let mine = await callEndpointAfterCD('bc/mine', 'post', {
      proof: `${proof}`
    })

    if (mine.status === 200) {
      console.log(`💖 Mined successfully!`)
    }

    break
  }
}

main()
