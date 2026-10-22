const Redis = require("ioredis").default
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

redis.on("connect", () => {
    console.log("server is connected to redis")
})//is code ka means hai server ko redis se connect karna 

module.exports = redis