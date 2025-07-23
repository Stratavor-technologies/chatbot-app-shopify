const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://anmolsecure50:Secure@50@cluster0.0m8toz0.mongodb.net/chatbot-app')
mongoose.connect('mongodb://localhost:27017/chatbot-app')
.then(() => {
    console.log('Database Connected!');
}).catch((err) => {
    console.log(`Database error: ${err}`);
})