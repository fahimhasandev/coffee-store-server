const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()
const port = process.env.PORT || 5001
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uida1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

//Middleware
app.use(
  cors({
    origin: ["https://coffee-store-server-peach-three.vercel.app/", "https://coffee-store-ae874.web.app/"]
  })
)
app.use(express.json())

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    const coffeeCollection = client.db("coffeeDB").collection("coffee")
    const UserCollection = client.db("coffeeDB").collection("usrs")

    //POST - create
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body
      console.log(newCoffee)

      const result = await coffeeCollection.insertOne(newCoffee)
      res.send(result)
    })

    //GET
    app.get("/coffee", async (req, res) => {
      const cursor = await coffeeCollection.find().toArray()
      res.send(cursor)
    })

    //Single GET ITems
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await coffeeCollection.findOne(query)
      res.send(result)
    })

    //Delete
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await coffeeCollection.deleteOne(query)
      res.send(result)
    })

    //update
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedCoffee = req.body
      const coffee = {
        $set: {
          name: updatedCoffee.name,
          quantity: updatedCoffee.quantity,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo
        }
      }

      const result = await coffeeCollection.updateOne(filter, coffee, options)
      res.send(result)
    })

    //Users relatd APIS
    app.post("/users", async (req, res) => {
      const newUser = req.body
      console.log(newUser)
      const result = await UserCollection.insertOne(newUser)
      res.send(result)
    })

    app.get("/users", async (req, res) => {
      const result = await UserCollection.find().toArray()
      res.send(result)
    })

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await UserCollection.findOne(query)
      res.send(result)
    })

    // email validaton
    app.patch("/users", async (req, res) => {
      const email = req.body.email
      const filter = { email }
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime
        }
      }
      console.log(updatedDoc)
      const result = await UserCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }

      const result = await UserCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log("Pinged your deployment. You successfully connected to MongoDB!")
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close()
  }
}
run().catch(console.dir)

//Get routes
app.get("/", (req, res) => {
  res.send("Hello")
})

app.listen(port, (req, res) => {
  console.log(`Server is listening on ${port}`)
})

// custom middleware
// const logger = (req, res, next) => {
//   console.log("Hi")
//   next()
// }

// app.post('/add-data,logger, (req, res) => {
// const data = req.body
// console.log(data)
// res.json({
//   status: true,
//   data: data
// })
//})
// app.use(express.json()) --> req.body converts into json
