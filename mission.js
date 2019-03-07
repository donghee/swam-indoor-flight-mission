// redis. download mission and mission control
const redis = require('redis')
const redisClient = redis.createClient() // localhost:6379

redisClient.on('error', function (err) {
    console.log('redis error' + err)
})

const {promisify} = require('util')
const getAsync = promisify(redisClient.get).bind(redisClient)
const setAsync = promisify(redisClient.set).bind(redisClient)

const saveMission = async function(droneId, mission) {
    try {
	const res = await setAsync(droneId, mission)
	return res
    } catch (error) {
	console.error(error)
    }
}

const loadMission = async function(droneId) {
    try {
	const mission = await getAsync(droneId)
	// console.log(mission)
	return mission
    } catch (error) {
	console.error(error)
    }
}

// saveMission('drone1', '{"x":0, "y":0, "z":1}')
// saveMission('drone2', '{"x":0, "y":0, "z":2}')
// saveMission('drone3', '{"x":0, "y":0, "z":3}')

// redisClient.mget(['drone1','drone2','drone3'], function(err, replies) {
//     const mission = JSON.parse('['+replies+']')
//     console.log(mission)
// })

// redisClient.keys("*", function(err, replies) {
//     console.log(replies)
//     redisClient.mget(replies, redis.print);
// })
const loadMissions = async function() {
    const mission1 = await loadMission('drone1')
    console.log(mission1)
    const mission2 = await loadMission('drone2')
    console.log(mission2)
    const mission3 = await loadMission('drone3')
    console.log(mission3)
}

loadMissions()
