const mongoose = require('mongoose');
const connectDatabase = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser : true,
        useUnifiedTopology : true,
        // useCreateIndex : true
    }).then( con => {
        console.log(`MongoDB connected with HOST : ${con.connection.host}`);
    })
}
module.exports = connectDatabase