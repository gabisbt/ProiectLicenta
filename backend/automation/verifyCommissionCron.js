import { User } from "../models/userSchema.js";
import { paymentProof } from "../models/commissionProofSchema.js";
import { Commission } from "../models/commissionSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import cron from "node-cron";

export const verifyCommissionCron = ()=> {
    cron.schedule("*/1 * * * *", async()=>{
        console.log("Running Verify Commission Cron...");
        const approvedProofs = await paymentProof.find({status: "Approved"});
        for(const proof of approvedProofs) {
            try {
                const user = await User.findById(proof.userId);
                let updatedUserData = {};
                if(user) {
                    if(user.unpaidCommission >= proof.amount) {
                        updatedUserData = await User.findByIdAndUpdate(user._id, {
                            $inc: {
                                unpaidCommission: -proof.amount
                            },
                        }, {new: true}
                    );
                    await paymentProof.findByIdAndUpdate(proof._id, {
                        status: "Settled",
                    });
                    } else { 
                        updatedUserData = await User.findByIdAndUpdate(
                            user._id, 
                        {
                           unpaidCommission: 0,
                        },
                        {new: true}
                    );
                    await paymentProof.findByIdAndUpdate(proof._id, {
                        status: "Settled",
                    });
                    }
                    await Commission.create({
                        amount: proof.amount,
                        user: user._id,
                    });
                    const settlementDate = new Date(Date.now())
                    .toString()
                    .substring(0, 15);

                    const subject = `Your Payment Has Been Successfully Verified And Settled`;
                    const message = `Dear ${user.userName},

                    We are pleased to inform you that your recent payment has been successfully verified and settled. Thank you for promptly providing the necessary proof of payment. Your account has been updated, and you can now proceed with your activities on our platform without any restrictions.

                    Payment Details:
                    • Amount Settled: ${proof.amount} RON
                    • Remaining Unpaid Amount: ${updatedUserData.unpaidCommission} RON
                    • Date of Settlement: ${settlementDate}

                    If you have any questions regarding this payment or your account status, please don't hesitate to contact our support team.

                    Thank you for being a valued member of our auction platform!

                    Best regards,
                    The Auction Platform Team`;
                    sendEmail({ email: user.email, subject, message });
                }
                console.log(`User ${proof.userId} paid commission of ${proof.amount}`);
            } catch (error) {
                console.log(`Error processing commission proof for user ${proof.userId}: ${error.message}`);
            }
        }
    })
}