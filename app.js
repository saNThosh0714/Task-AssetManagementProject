const express = require('express');
const app = express();
const cors= require("cors");

const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;

const sequelize = require("./db");
const controlller = require("./controller/main");

app.use(cors());


async function main() {
  try {
    await sequelize.sync({ alter: true });
    // Create tables if not exist
  } catch (err) {
    console.error("Database sync error : " + err);
  }
}

main();

// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/main/', controlller);

// route to index
app.get('/', (req, res) => {
  res.render('index');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
