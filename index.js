const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());

//add User pass from dotenv

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uompt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

//check on cmd 
// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run named Function for server to db
async function run() {
    try {

        //making db and Collection on database
        await client.connect();
        const database = client.db('RoyalWatches');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const cartsCollection = database.collection('carts');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // getting all users(its should Delete)
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const appointments = await cursor.toArray();
            res.json(appointments);
        })
        // getting all users(its should Delete)
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })
        //Getting Specific Product that user clicked
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await productsCollection.findOne(query);
            res.json(package)
        })

        //chacking Is admin true or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin });
        })
        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const cursor = cartsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments)
        })
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments)
        })
        app.get('/orders', async (req, res) => {  
            const cursor = ordersCollection.find({});
            const appointments = await cursor.toArray();
            res.json(appointments)
        })
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.find({});
            const result = await reviews.toArray();
            res.json(result)
        });


        // Adding product from admin Dashboard 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await productsCollection.insertOne(user);
            res.json(result);
        });

        app.post('/carts', async (req, res) => {
            const user = req.body;
            const result = await cartsCollection.insertOne(user);
            res.json(result);
        });

        app.post('/orders', async (req, res) => {
            const user = req.body;
            const result = await ordersCollection.insertMany(user);
            res.json(result);
        });

        // Adding user those who register buy google 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        // posting reviews on server that comes clint side reviewsCollection 

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        });
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.json(result);
        })
        app.delete('/allCarts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: { $regex: `${email}` } };
            // const query = { _id: ObjectId(id) };
            const result = await cartsCollection.deleteMany(query);
            res.json(result);
        })




    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


//checking first time
app.get('/', (req, res) => {
    res.send('Hello Royal watch Team');
});

app.listen(port, () => {
    console.log('listening at', port);
});