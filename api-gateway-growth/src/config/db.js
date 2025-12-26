// --- SET UP
const mongoose = require('mongoose');
const { db } = require('../../conf');

// --- CONNECT TO THE CLOUD
mongoose.connect(db).then(() => {
    console.log('database connected succefully...');
}).catch(err => {
    console.log(err);
})