const express = require('express');
const cors = require("cors");
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pbafkul.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const userCollection = client.db('house_hunter').collection('users');
        const roomCollection = client.db('house_hunter').collection('rooms');
        const bookCollection = client.db('house_hunter').collection('bookings');

        // add signuped user
        app.post('/addUser', async (req, res) => {
            const post = req.body;
            const email = req.body.email;
            const query = { email: email }
            const findUser = await userCollection.findOne(query);
            if (findUser) {
                res.send(false);
            } else {
                const result = await userCollection.insertOne(post);
                res.send(result);
            }

        });

        // delete a booking
        app.delete('/deleteBooking', async (req, res) => {
            const id = req.query.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        });

        // delete a user
        app.delete('/deleteRoom', async (req, res) => {
            const id = req.query.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomCollection.deleteOne(query);
            res.send(result);
        });

        //getHouseInfoById
        app.get('/getHouseInfoById/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await roomCollection.findOne(query);
            res.send(result);
        })

        //get room by id
        app.get('/bookRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomCollection.findOne(query);
            res.send(result);
        })

        //myBookings
        app.get('/myBookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookCollection.find(query).toArray();
            res.send(result);
        })

        //get room by id
        app.get('/myHouses', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await roomCollection.find(query).toArray();
            res.send(result);
        })

        // add addRoom 
        app.post('/addRoom', async (req, res) => {
            const post = req.body;
            const result = await roomCollection.insertOne(post);
            res.send(result)

        });

        // add booking 
        app.post('/addBooking', async (req, res) => {
            const post = req.body;
            console.log(post)
            const query = { email: req.body.email, picture: req.body.picture }
            const find = await bookCollection.findOne(query)
            if (find) {
                res.send(false)
            } else {
                const result = await bookCollection.insertOne(post);
                res.send(result)
            }
        });


        // add signuped user
        app.put('/updateRoomData/:id', async (req, res) => {
            const id = req.params.id;
            const post = req.body;
            console.log(post)
            const query = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    bathRoom: post.bathRoom,
                    bedrooms: post.bedrooms,
                    city: post.city,
                    description: post.description,
                    name: post.name,
                    phone: post.phone,
                    picture: post.picture,
                    rent: post.rent,
                    roomSize: post.roomSize
                }
            }
            const result = await roomCollection.updateOne(query, updatedDoc, option);
            res.send(result);

        });

        //get login user
        app.get('/User', async (req, res) => {
            const id = req.query.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result);
        })


        //get all Rooms
        app.get('/allRooms', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const query = {};
            const result = await roomCollection.find(query).skip(page * size).limit(size).toArray();
            const count = await roomCollection.estimatedDocumentCount();
            res.send({ count, result });
        })
        //filter all Rooms
        app.get('/filter', async (req, res) => {
            const page = req.query.page;
            const city = req.query.city;
            const rent = req.query.rent;
            const bedrooms = req.query.bedrooms;
            const bathRoom = req.query.bathRoom;
            const roomSize = req.query.roomSize;
            const size = parseInt(req.query.size);
            const query = {
                $or: [
                    {
                        city: { $regex: city, $options: 'i' },
                        rent: { $regex: rent, $options: 'i' },
                        bedrooms: { $regex: bedrooms, $options: 'i' },
                        bathRoom: { $regex: bathRoom, $options: 'i' },
                        roomSize: { $regex: roomSize, $options: 'i' }
                    }
                ]
            };
            const result = await roomCollection.find(query).skip(page * size).limit(size).toArray();
            const count = await roomCollection.estimatedDocumentCount();
            res.send({ count, result });
        })



        app.post('/getUserByEmail', async (req, res) => {
            const findQuery = { email: req.body.email, password: req.body.password };
            const find = await userCollection.findOne(findQuery);
            if (find) {
                const query = { email: req.body.email, password: req.body.password };
                const result = await userCollection.findOne(query);
                res.send(result);
            } else {
                res.send(false);
            }

        })



    } finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running');
});



app.listen(port, () => console.log('server is running on', port));