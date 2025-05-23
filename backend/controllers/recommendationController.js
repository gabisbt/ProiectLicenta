import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { Favorite } from "../models/favoriteSchema.js";
import { Bid } from "../models/bidSchema.js";

// Obține recomandări personalizate de licitații pentru un utilizator
export const getPersonalizedRecommendations = catchAsyncErrors(async (req, res, next) => {
    // Verifică dacă utilizatorul este autentificat
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler("User not authenticated", 401));
    }
    
    // Obține ID-ul utilizatorului
    const userId = req.user._id;
    
    try {   
        // 1. Obține istoricul utilizatorului
        const userFavorites = await Favorite.find({ user: userId }).populate('auction');
        const userBids = await Bid.find({ 'bidder.id': userId }).populate('auctionItem');
        const user = await User.findById(userId).select('wonAuctionsDetails');
        
        // Adaugă aceste log-uri pentru debugging
        console.log("User ID:", userId);
        console.log("Favorites:", userFavorites.length);
        console.log("Bids:", userBids.length);
        console.log("Won auctions:", user?.wonAuctionsDetails?.length || 0);
        
        // 2. Extrage categorii și preferințe
        const favoriteCategories = new Map();
        const favoriteConditions = new Map();
        const priceRanges = [];
        
        // Analizează favoritele utilizatorului
        userFavorites.forEach(fav => {
            if (fav.auction) {
                // Incrementează scorul pentru această categorie
                const category = fav.auction.category;
                favoriteCategories.set(category, (favoriteCategories.get(category) || 0) + 3);
                
                // Incrementează scorul pentru această condiție
                const condition = fav.auction.condition;
                favoriteConditions.set(condition, (favoriteConditions.get(condition) || 0) + 2);
                
                // Adaugă prețul în array pentru a calcula intervalul
                priceRanges.push(fav.auction.startingBid);
            }
        });
        
        // Analizează licitațiile la care a participat
        userBids.forEach(bid => {
            if (bid.auctionItem) {
                const category = bid.auctionItem.category;
                favoriteCategories.set(category, (favoriteCategories.get(category) || 0) + 5);
                
                const condition = bid.auctionItem.condition;
                favoriteConditions.set(condition, (favoriteConditions.get(condition) || 0) + 3);
                
                priceRanges.push(bid.amount);
            }
        });
        
        // Analizează licitațiile câștigate
        if (user.wonAuctionsDetails && user.wonAuctionsDetails.length > 0) {
            // Pentru fiecare licitație câștigată, încercăm să obținem detaliile complete
            const wonAuctionsIds = user.wonAuctionsDetails.map(item => item.auctionId);
            const wonAuctions = await Auction.find({ _id: { $in: wonAuctionsIds } });
            
            wonAuctions.forEach(auction => {
                const category = auction.category;
                favoriteCategories.set(category, (favoriteCategories.get(category) || 0) + 7);
                
                const condition = auction.condition;
                favoriteConditions.set(condition, (favoriteConditions.get(condition) || 0) + 4);
                
                priceRanges.push(auction.currentBid || auction.startingBid);
            });
        }
        
        // 3. Calculăm preferințele utilizatorului
        const topCategories = [...favoriteCategories.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
            
        const topConditions = [...favoriteConditions.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(entry => entry[0]);
        
        // Calculăm intervalul de preț preferat (cu 20% mai mare/mic decât media)
        let avgPrice = 0;
        if (priceRanges.length > 0) {
            avgPrice = priceRanges.reduce((sum, price) => sum + parseFloat(price), 0) / priceRanges.length;
        }
        const minPrice = avgPrice * 0.8;
        const maxPrice = avgPrice * 1.5;
        
        // 4. Găsește licitații active care corespund profilului utilizatorului
        const now = new Date();
        const activeAuctions = await Auction.find({
            // Elimină temporar condițiile de timp pentru a vedea dacă găsești licitații
            // care sunt active
            category: { $in: topCategories },
            condition: { $in: topConditions },
            startingBid: { $gte: minPrice, $lte: maxPrice },
            // startTime: { $lte: now },


            // startTime: { $lte: now },
        });
        console.log("All auctions (without time filter):", activeAuctions.length);
        
        const allActiveAuctions = await Auction.find({
            startTime: { $lte: now },
            endTime: { $gt: now }
        });
        console.log("Total active auctions:", allActiveAuctions.length);
        
        // 5. Calculăm scorul pentru fiecare licitație activă
        const scoredAuctions = activeAuctions.map(auction => {
            let score = 0;
            
            // Categorie
            if (topCategories.includes(auction.category)) {
                score += 5 * (1 + topCategories.indexOf(auction.category) * -0.2); // Prima categorie are cel mai mare scor
            }
            
            // Condiție
            if (topConditions.includes(auction.condition)) {
                score += 3 * (1 + topConditions.indexOf(auction.condition) * -0.2);
            }       
            
            // Preț în intervalul preferat
            const price = parseFloat(auction.startingBid);
            if (price >= minPrice && price <= maxPrice) {
                score += 4;
            }
            
            // Bonus pentru licitațiile care se încheie curând (în următoarele 24 de ore)
            const timeRemaining = new Date(auction.endTime) - now;
            const hoursRemaining = timeRemaining / (1000 * 60 * 60);
            if (hoursRemaining <= 24) {
                score += 2;
            }   
            
            return {
                auction,
                score
            };
        });
        
        // 6. Sortează și returnează top N recomandări
        const recommendations = scoredAuctions
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.auction);
        
        // Adaugă acest log pentru a vedea numărul de recomandări generate
        console.log("Generated recommendations:", recommendations.length);
        
        res.status(200).json({
            success: true,
            recommendations
        });
        
    } catch (error) {
        // Adaugă acest log pentru a vedea eroarea completă
        console.error("Error in getPersonalizedRecommendations:", error);
        return next(new ErrorHandler(error.message || "Failed to generate recommendations", 500));
    }
});

// Obține recomandări simple bazate doar pe categoria licitației curente
export const getSimilarAuctions = catchAsyncErrors(async (req, res, next) => {
    const { auctionId } = req.params;
    
    try {
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return next(new ErrorHandler("Auction not found", 404));
        }
        
        const now = new Date();
        
        // Găsește licitații active din aceeași categorie
        const similarAuctions = await Auction.find({
            _id: { $ne: auctionId },
            category: auction.category,
            startTime: { $lte: now },
            endTime: { $gt: now }
        }).limit(5);
        
        res.status(200).json({
            success: true,
            similarAuctions
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to find similar auctions", 500));
    }
});

