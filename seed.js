const mongoose = require('mongoose');
const CarModel = require('./models/CarModel');
const CarType = require('./models/CarType');
const Location = require('./models/Location');

mongoose.connect('mongodb://127.0.0.1:27017/used-auto-parts');

async function seed() {
  await CarModel.deleteMany();
  await CarType.deleteMany();
  await Location.deleteMany();

  await CarModel.insertMany([
    { name: 'Toyota Corolla' },
    { name: 'Honda Civic' },
    { name: 'Nissan Altima' }
  ]);

  await CarType.insertMany([
    { type: 'Sedan' },
    { type: 'SUV' },
    { type: 'Truck' }
  ]);

  await Location.insertMany([
    { location: 'Engine' },
    { location: 'Transmission' },
    { location: 'Interior' }
  ]);

  console.log('Database seeded!');
  process.exit();
}

seed();
