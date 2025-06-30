import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { commissionCalculated } from "../controllers/commissionControlller.js";

export const endedAuctionCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        const now = new Date();
        console.log("Cron for ended auction running...", now);
        
        try {
            const endedAuctions = await Auction.find({
                endTime: { $lt: now },
                commissionCalculated: false,
            });

            console.log(`Found ${endedAuctions.length} ended auctions to process`);

            for (const auction of endedAuctions) {
                try {
                    console.log(`Processing auction: ${auction.title} (ID: ${auction._id})`);
                    
                    const commissionAmount = await commissionCalculated(auction._id);
                    auction.commissionCalculated = true;
                    
                    const highestBidder = await Bid.findOne({
                        auctionItem: auction._id,
                        amount: auction.currentBid,
                    });
                    
                    const auctioneer = await User.findById(auction.createdBy);
                    
                    if (highestBidder && auctioneer) {
                        console.log(`Found highest bidder: ${highestBidder.bidder.id}`);
                        
                        auction.highestBidder = highestBidder.bidder.id;
                        await auction.save();
                        
                        const bidder = await User.findById(highestBidder.bidder.id);
                        
                        if (bidder) {
                            const alreadyWon = await User.findOne({
                                _id: bidder._id,
                                'wonAuctionsDetails.auctionId': auction._id
                            });

                            if (!alreadyWon) {
                                await User.findByIdAndUpdate(
                                    bidder._id,
                                    {
                                        $inc: {
                                            moneySpent: highestBidder.amount,
                                            auctionsWon: 1,
                                        },
                                        $push: {
                                            wonAuctionsDetails: {
                                                auctionId: auction._id,
                                                title: auction.title,
                                                finalBid: highestBidder.amount,
                                                wonAt: new Date(),
                                                image: auction.image,
                                                paymentStatus: 'Pending Payment'
                                            }
                                        }
                                    },
                                    { new: true }
                                );
                                
                                console.log(`Updated bidder stats for: ${bidder.userName}`);
                            } else {
                                console.log(`Auction already processed for bidder: ${bidder.userName}`);
                            }

                            await User.findByIdAndUpdate(
                                auctioneer._id,
                                {
                                    $inc: {
                                        unpaidCommission: commissionAmount
                                    }
                                },
                                { new: true }
                            );

                            const subject = `Congratulations! You won the auction for ${auction.title}`;
                            const message = `Dear ${bidder.userName},\n\nCongratulations! You have won the auction for "${auction.title}" with a bid of ${highestBidder.amount} RON.\n\n` +
                                `Before proceeding with payment, please contact your seller via email: ${auctioneer.email}\n\n` +
                                `Please complete your payment using one of the following methods:\n\n` +
                                `1. **Bank Transfer**:\n` +
                                `- Account Name: ${auctioneer.paymentMethods?.bankTransfer?.bankAccountName || 'Not provided'}\n` +
                                `- Account Number: ${auctioneer.paymentMethods?.bankTransfer?.bankAccountNumber || 'Not provided'}\n` +
                                `- Bank: ${auctioneer.paymentMethods?.bankTransfer?.bankName || 'Not provided'}\n\n` +
                                `2. **PayPal**:\n` +
                                `- Send payment to: ${auctioneer.paymentMethods?.paypal?.paypalEmail || 'Not provided'}\n\n` +
                                `3. **Cash on Delivery (COD)**:\n` +
                                `- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n` +
                                `- To pay the 20% upfront, use any of the above methods.\n` +
                                `- The remaining 80% will be paid upon delivery.\n\n` +
                                `If you want to see the condition of your purchased item, contact the seller at: ${auctioneer.email}\n\n` +
                                `Please ensure your payment is completed promptly. Once we confirm the payment, the item will be shipped to you.\n\n` +
                                `Thank you for your participation!\n\nBest regards,\nRetroShop Team`;

                            console.log(`SENDING EMAIL TO HIGHEST BIDDER: ${bidder.email}`);
                            
                            await sendEmail({ 
                                email: bidder.email, 
                                subject, 
                                message 
                            });
                            
                            console.log("SUCCESSFULLY SENT EMAIL TO HIGHEST BIDDER");
                        } else {
                            console.log("Bidder not found in database");
                        }
                    } else {
                        console.log(`No highest bidder found for auction: ${auction.title}`);
                        await auction.save(); 
                    }
                } catch (error) {
                    console.error(`Error processing auction ${auction._id}:`, error);
                }
            }
        } catch (error) {
            console.error("Error in ended auction cron:", error);
        }
    });
};
