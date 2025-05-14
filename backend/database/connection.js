import mongoose from 'mongoose';

export const connection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "Auction_Platform"                                     
    })
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((err) => {
        console.log(`Database connection error:  ${err}`);
    });
}