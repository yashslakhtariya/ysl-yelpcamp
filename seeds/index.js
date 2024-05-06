const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log("Mongoose Connection Open!!");
}

const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers');

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
  await Campground.deleteMany({});
  for(let i = 0; i < 300; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      author: '642179fea49a3f9eef0837a2',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deleniti distinctio, quis fugit, enim porro quisquam consequuntur suscipit deserunt labore ea repellendus qui adipisci voluptatibus nihil quasi provident eius reiciendis sit.',
      price: Math.floor(Math.random() * 20) + 10,
      geometry: { 
        type: 'Point',
        coordinates: [
          cities[random1000].longitude, 
          cities[random1000].latitude
        ] 
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dvyupgekf/image/upload/v1680693041/Yelpcamp/ekix2nh5i79tks5et9vs.jpg',
          filename: 'Yelpcamp/ekix2nh5i79tks5et9vs'
        },
        {
          url: 'https://res.cloudinary.com/dvyupgekf/image/upload/v1680693043/Yelpcamp/ec9bwyw4logzfxpyfdry.jpg',
          filename: 'Yelpcamp/ec9bwyw4logzfxpyfdry'
        }
      ]
    });
    camp.save();
  }
}

seedDB();