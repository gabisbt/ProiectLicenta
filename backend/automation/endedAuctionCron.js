//modelele Auction, User, Bid pentru interactiunea cu baza de date
//functiile sendEmail si commissionCalculated pentru trimiterea email + calculare comision
import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { commissionCalculated } from "../controllers/commissionControlller.js";


//Acest cod defineste o sarcina cron care ruleaza la fiecare minut si gestioneaza licitatiile care s-au incheiat
//Calculeaza comisionul, actualizeaza informatii despre utilizatori si trimite un email castigatorului licitatiei
export const endedAuctionCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        const now = new Date();
        console.log("Cron for ended auction running...")
        const endedAuctions = await Auction.find({
            endTime: { $lt: now },
            commissionCalculated: false,
        });

        //pentru licitatiile incheiate se calculeaza comisionul, marcheaza licitatia procesata si cauta/gaseste cel mai mare licitator + vanzatorul
        for (const auction of endedAuctions) {
            try {
                const commissionAmount = await commissionCalculated(auction._id);
                auction.commissionCalculated = true;
                const highestBidder = await Bid.findOne({
                    auctionItem: auction._id,
                    amount: auction.currentBid,
                });
                const auctioneer = await User.findById(auction.createdBy);
                auctioneer.unpaidCommission = commissionAmount;
                if (highestBidder) {
                    auction.highestBidder = highestBidder.bidder.id;
                    await auction.save();
                    const bidder = await User.findById(highestBidder.bidder.id);

                    // Verifica daca licitatia exista deja in wonAuctionsDetails
                    const alreadyWon = await User.findOne({
                        _id: bidder._id,
                        'wonAuctionsDetails.auctionId': auction._id
                    });

                    if (!alreadyWon) {
                        // Doar daca nu exista deja, adaugă licitatia in wonAuctionsDetails
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
                            }
                        );
                    }

                    await User.findByIdAndUpdate(auctioneer._id,
                        {
                            $inc: {
                                unpaidCommission: commissionAmount
                            }
                        },
                        { new: true }
                    );
                    const subject = `Congratulations! You won the auction for ${auction.title}`;
                    const message = `Draga ${bidder.userName}, \n\nFelicitari! Ai castigat licitatia pentru ${auction.title}. \n\nInainte de a continua cu plata, te rugam sa iei legatura cu organizatorul licitatiei la adresa de email: ${auctioneer.email} \n\nTe rugam sa finalizezi plata folosind una dintre urmatoarele metode: \n\n1. **Transfer bancar**: \n- Nume cont: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Numar cont: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Banca: ${auctioneer.paymentMethods.bankTransfer.bankName} \n\n2. **PayPal**: \n- Trimite plata catre: ${auctioneer.paymentMethods.paypal.paypalEmail} \n\n3. **Ramburs (Cash on Delivery - COD)**: \n- Daca preferi plata ramburs, este necesar sa achiti un avans de 20% din suma totala inainte de livrare. \n- Pentru a plati avansul de 20%, foloseste oricare dintre metodele de mai sus. \n- Restul de 80% va fi platit la livrare. \n\nDaca doresti sa vezi starea obiectului castigat inainte de livrare, trimite un email la: ${auctioneer.email} \n\nTe rugam sa efectuezi plata pana la data limita: [Payment Due Date]. Dupa confirmarea platii, produsul va fi expediat catre tine. \n\nCu respect, \nEchipa RetroShop`;

                    console.log("SENDING EMAIL TO HIGHEST BIDDER");
                    sendEmail({ email: bidder.email, subject, message });
                    console.log("SUCCESSFULLY EMAIL SEND TO HIGHEST BIDDER");
                } else {
                    await auction.save();
                }
            } catch (error) {
                return next(console.error(error || "Some error in ended auction cron"));
            }
        }
    });
};
