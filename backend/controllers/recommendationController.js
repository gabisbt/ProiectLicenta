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
        console.log("=== GENERATING PERSONALIZED RECOMMENDATIONS ===");
        console.log("User ID:", userId);
        
        // 1. Obține istoricul utilizatorului
        const userFavoritesRaw = await Favorite.find({ user: userId }).populate('auction');
        const userFavorites = userFavoritesRaw.filter(fav => fav.auction && fav.auction._id);
        
        // Elimină duplicatele
        const uniqueFavorites = [];
        const seenAuctionIds = new Set();
        userFavorites.forEach(fav => {
            const auctionId = fav.auction._id.toString();
            if (!seenAuctionIds.has(auctionId)) {
                seenAuctionIds.add(auctionId);
                uniqueFavorites.push(fav);
            }
        });

        const userBids = await Bid.find({ 'bidder.id': userId }).populate('auctionItem');
        const user = await User.findById(userId).select('wonAuctionsDetails averageRating totalReviews moneySpent auctionsWon');
        
        console.log("User profile:", {
            favorites: uniqueFavorites.length,
            bids: userBids.length,
            wonAuctions: user?.wonAuctionsDetails?.length || 0,
            moneySpent: user?.moneySpent || 0,
            auctionsWon: user?.auctionsWon || 0
        });

        // 2. Analizează preferințele utilizatorului cu scoring advanced
        const userProfile = {
            categories: new Map(),
            conditions: new Map(),
            priceRanges: [],
            timePreferences: new Map(), // Nou: preferințe de timp
            activityLevel: 'low', // Nou: nivel de activitate
            spendingPattern: 'conservative', // Nou: pattern de cheltuieli
            preferredSellers: new Set(), // Nou: vânzători preferați
            excludedCategories: new Set() // Nou: categorii de evitat
        };

        // 3. Analizează favoritele (weight: 3x)
        uniqueFavorites.forEach(fav => {
            if (fav.auction) {
                const auction = fav.auction;
                console.log("Processing favorite:", auction.title, auction.category);
                
                // Categoria
                const category = auction.category;
                userProfile.categories.set(category, (userProfile.categories.get(category) || 0) + 3);
                
                // Condiția
                const condition = auction.condition;
                userProfile.conditions.set(condition, (userProfile.conditions.get(condition) || 0) + 2);
                
                // Preț
                userProfile.priceRanges.push(auction.startingBid);
                
                // Vânzător preferat
                if (auction.createdBy) {
                    userProfile.preferredSellers.add(auction.createdBy.toString());
                }
                
                // Analizează timpul când a fost adăugat la favorite
                const hour = new Date(fav.createdAt || Date.now()).getHours();
                const timeSlot = getTimeSlot(hour);
                userProfile.timePreferences.set(timeSlot, (userProfile.timePreferences.get(timeSlot) || 0) + 1);
            }
        });

        // 4. Analizează licitațiile utilizatorului (weight: 2x)
        userBids.forEach(bid => {
            if (bid.auctionItem) {
                const auction = bid.auctionItem;
                console.log("Processing bid:", auction.title, auction.category);
                
                userProfile.categories.set(auction.category, (userProfile.categories.get(auction.category) || 0) + 2);
                userProfile.conditions.set(auction.condition, (userProfile.conditions.get(auction.condition) || 0) + 1);
                userProfile.priceRanges.push(bid.amount);
                
                if (auction.createdBy) {
                    userProfile.preferredSellers.add(auction.createdBy.toString());
                }
            }
        });

        // 5. Analizează licitațiile câștigate (weight: 4x - cel mai important)
        if (user?.wonAuctionsDetails) {
            user.wonAuctionsDetails.forEach(won => {
                console.log("Processing won auction:", won.title);
                
                // Categoriile câștigate sunt foarte importante
                userProfile.categories.set(won.category || 'unknown', (userProfile.categories.get(won.category || 'unknown') || 0) + 4);
                userProfile.conditions.set(won.condition || 'unknown', (userProfile.conditions.get(won.condition || 'unknown') || 0) + 3);
                userProfile.priceRanges.push(won.finalBid);
            });
        }

        // 6. Determină profilul utilizatorului
        userProfile.activityLevel = determineActivityLevel(userBids.length, user?.auctionsWon || 0);
        userProfile.spendingPattern = determineSpendingPattern(user?.moneySpent || 0, userProfile.priceRanges);

        console.log("User profile analysis:", {
            topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3),
            topConditions: Array.from(userProfile.conditions.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3),
            activityLevel: userProfile.activityLevel,
            spendingPattern: userProfile.spendingPattern,
            preferredSellers: userProfile.preferredSellers.size
        });

        // 7. Calculează intervalul de preț personalizat
        const pricePreferences = calculatePersonalizedPriceRange(userProfile.priceRanges, userProfile.spendingPattern);

        // 8. Găsește licitații disponibile
        const now = new Date();
        const availableAuctions = await Auction.find({
            createdBy: { $ne: userId },
            endTime: { $gt: now },
            startTime: { $lt: now } // Doar licitații active
        })
        .populate('createdBy', 'userName averageRating')
        .select('title category condition startingBid currentBid endTime startTime image createdBy');

        console.log("Available auctions:", availableAuctions.length);

        // 9. Calculează scorurile personalizate pentru fiecare licitație
        const recommendations = [];

        availableAuctions.forEach(auction => {
            const score = calculatePersonalizedScore(auction, userProfile, pricePreferences);
            
            if (score.total > 0) {
                recommendations.push({
                    ...auction.toObject(),
                    recommendationScore: score.total,
                    recommendationReasons: score.reasons,
                    personalizedRank: score.rank
                });
            }
        });

        // 10. Sortează și limitează rezultatele
        const finalRecommendations = recommendations
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 20) // Mărește numărul pentru diversitate
            .map((rec, index) => ({
                ...rec,
                recommendationRank: index + 1
            }));

        console.log("Generated recommendations:", finalRecommendations.length);
        console.log("Top 3 recommendations:", finalRecommendations.slice(0, 3).map(r => ({
            title: r.title,
            score: r.recommendationScore,
            reasons: r.recommendationReasons
        })));
        
        res.status(200).json({
            success: true,
            recommendations: finalRecommendations,
            userProfile: {
                activityLevel: userProfile.activityLevel,
                spendingPattern: userProfile.spendingPattern,
                topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
            }
        });
        
    } catch (error) {
        console.error("Error in getPersonalizedRecommendations:", error);
        return next(new ErrorHandler(error.message || "Failed to generate recommendations", 500));
    }
});

// Funcții helper pentru analiză personalizată
function getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

function determineActivityLevel(bidsCount, wonCount) {
    const totalActivity = bidsCount + (wonCount * 2);
    if (totalActivity > 20) return 'high';
    if (totalActivity > 5) return 'medium';
    return 'low';
}

function determineSpendingPattern(totalSpent, priceRanges) {
    if (totalSpent > 5000) return 'premium';
    if (totalSpent > 1000) return 'moderate';
    if (priceRanges.length > 0) {
        const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
        if (avgPrice > 500) return 'moderate';
    }
    return 'conservative';
}

function calculatePersonalizedPriceRange(priceRanges, spendingPattern) {
    if (priceRanges.length === 0) {
        switch (spendingPattern) {
            case 'premium': return { min: 500, max: 10000 };
            case 'moderate': return { min: 100, max: 2000 };
            default: return { min: 0, max: 500 };
        }
    }

    const sortedPrices = priceRanges.sort((a, b) => a - b);
    const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    const iqr = q3 - q1;
    
    // Ajustează intervalul în funcție de pattern-ul de cheltuieli
    const expansion = spendingPattern === 'premium' ? 1.5 : spendingPattern === 'moderate' ? 1.2 : 0.8;
    
    return {
        min: Math.max(0, q1 - (iqr * expansion)),
        max: q3 + (iqr * expansion)
    };
}

function calculatePersonalizedScore(auction, userProfile, pricePreferences) {
    let score = 0;
    const reasons = [];
    let rank = 'standard';

    // 1. Categoria (weight: 40%)
    const categoryScore = userProfile.categories.get(auction.category) || 0;
    if (categoryScore > 0) {
        const categoryPoints = Math.min(categoryScore * 2, 20); // Max 20 puncte
        score += categoryPoints;
        reasons.push(`Interested in ${auction.category} (+${categoryPoints})`);
        
        if (categoryScore >= 6) rank = 'highly_recommended';
    }

    // 2. Condiția (weight: 20%)
    const conditionScore = userProfile.conditions.get(auction.condition) || 0;
    if (conditionScore > 0) {
        const conditionPoints = Math.min(conditionScore * 1.5, 10); // Max 10 puncte
        score += conditionPoints;
        reasons.push(`Prefers ${auction.condition} condition (+${conditionPoints})`);
    }

    // 3. Intervalul de preț (weight: 25%)
    const currentPrice = auction.currentBid || auction.startingBid;
    if (currentPrice >= pricePreferences.min && currentPrice <= pricePreferences.max) {
        const pricePoints = 15;
        score += pricePoints;
        reasons.push(`Within price range (+${pricePoints})`);
    } else if (currentPrice < pricePreferences.min) {
        // Preț mai mic decât preferat - bonus mic
        const pricePoints = 5;
        score += pricePoints;
        reasons.push(`Great deal (+${pricePoints})`);
    }

    // 4. Vânzător preferat (weight: 10%)
    if (userProfile.preferredSellers.has(auction.createdBy._id.toString())) {
        const sellerPoints = 8;
        score += sellerPoints;
        reasons.push(`Trusted seller (+${sellerPoints})`);
        rank = 'highly_recommended';
    }

    // 5. Rating vânzător (weight: 5%)
    if (auction.createdBy.averageRating) {
        const ratingPoints = Math.floor(auction.createdBy.averageRating * 2); // Max 10 puncte
        score += ratingPoints;
        reasons.push(`Seller rating: ${auction.createdBy.averageRating}★ (+${ratingPoints})`);
    }

    // 6. Bonus pentru diversitate (evită să recomande doar aceeași categorie)
    const diversityBonus = userProfile.categories.size > 1 ? 3 : 0;
    score += diversityBonus;

    // 7. Timing bonus (licitații care se termină în curând)
    const timeLeft = new Date(auction.endTime) - new Date();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    if (hoursLeft < 24 && hoursLeft > 1) {
        const urgencyPoints = 5;
        score += urgencyPoints;
        reasons.push(`Ending soon (+${urgencyPoints})`);
    }

    return {
        total: Math.round(score * 100) / 100,
        reasons,
        rank
    };
}

// Obține recomandări simple bazate doar pe categoria licitației curente
export const getSimilarAuctions = catchAsyncErrors(async (req, res, next) => {
    const { auctionId } = req.params;
    
    console.log('🔍 getSimilarAuctions called for:', auctionId);
    
    try {
        // Găsește licitația curentă
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            console.log('❌ Auction not found:', auctionId);
            return next(new ErrorHandler("Auction not found", 404));
        }
        
        console.log('📋 Current auction:', {
            id: auction._id,
            title: auction.title,
            category: auction.category,
            condition: auction.condition,
            startingBid: auction.startingBid,
            endTime: auction.endTime,
            startTime: auction.startTime
        });
        
        const now = new Date();
        console.log('⏰ Current time:', now.toISOString());
        
        // STEP 1: Verifică toate licitațiile disponibile (pentru debugging)
        const allAuctions = await Auction.find({
            _id: { $ne: auctionId }
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log('📊 Total other auctions in database:', allAuctions.length);
        
        // STEP 2: Licitații din aceeași categorie (fără restricții de timp)
        const sameCategoryAuctions = await Auction.find({
            _id: { $ne: auctionId },
            category: auction.category
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log(`📊 Auctions in "${auction.category}" category:`, sameCategoryAuctions.length);
        
        // STEP 3: Licitații active din aceeași categorie
        const activeSameCategoryAuctions = await Auction.find({
            _id: { $ne: auctionId },
            category: auction.category,
            endTime: { $gt: now }
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log(`📊 Active auctions in "${auction.category}":`, activeSameCategoryAuctions.length);
        
        // STEP 4: Strategie multiplă pentru a găsi recomandări
        let similarAuctions = [];
        let strategy = '';
        
        // Strategia 1: Licitații active din aceeași categorie
        if (activeSameCategoryAuctions.length >= 3) {
            strategy = 'active_same_category';
            similarAuctions = await Auction.find({
                _id: { $ne: auctionId },
                category: auction.category,
                endTime: { $gt: now }
            })
            .populate('createdBy', 'userName averageRating')
            .select('title category condition startingBid currentBid endTime startTime image createdBy')
            .limit(12)
            .lean();
        }
        // Strategia 2: Toate licitațiile din aceeași categorie (chiar dacă nu sunt active)
        else if (sameCategoryAuctions.length >= 3) {
            strategy = 'all_same_category';
            similarAuctions = await Auction.find({
                _id: { $ne: auctionId },
                category: auction.category
            })
            .populate('createdBy', 'userName averageRating')
            .select('title category condition startingBid currentBid endTime startTime image createdBy')
            .limit(12)
            .lean();
        }
        // Strategia 3: Licitații cu aceeași condiție
        else {
            strategy = 'similar_characteristics';
            similarAuctions = await Auction.find({
                _id: { $ne: auctionId },
                $or: [
                    { condition: auction.condition },
                    { category: auction.category },
                    {
                        startingBid: {
                            $gte: Math.max(1, auction.startingBid * 0.3),
                            $lte: auction.startingBid * 3
                        }
                    }
                ]
            })
            .populate('createdBy', 'userName averageRating')
            .select('title category condition startingBid currentBid endTime startTime image createdBy')
            .limit(15)
            .lean();
        }
        
        console.log(`📦 Found ${similarAuctions.length} similar auctions using strategy: ${strategy}`);
        
        if (similarAuctions.length > 0) {
            console.log('📋 Sample similar auctions:');
            similarAuctions.slice(0, 5).forEach((sim, index) => {
                const isActive = new Date(sim.endTime) > now;
                console.log(`${index + 1}. "${sim.title}" - ${sim.category} - ${sim.condition} - Active: ${isActive}`);
            });
        }
        
        // STEP 5: Calculează scoruri avansate de similaritate
        const scoredAuctions = similarAuctions.map(simAuction => {
            let score = 0;
            const reasons = [];
            
            // Categoria (cel mai important)
            if (simAuction.category === auction.category) {
                score += 10;
                reasons.push('Same category');
            }
            
            // Condiția
            if (simAuction.condition === auction.condition) {
                score += 5;
                reasons.push('Same condition');
            }
            
            // Intervalul de preț
            const priceDiff = Math.abs((simAuction.startingBid || 0) - auction.startingBid);
            const priceThreshold = auction.startingBid * 0.5;
            if (priceDiff <= priceThreshold) {
                score += 3;
                reasons.push('Similar price');
            } else if (priceDiff <= auction.startingBid) {
                score += 1;
                reasons.push('Comparable price');
            }
            
            // Bonus pentru licitații active
            const isActive = new Date(simAuction.endTime) > now;
            if (isActive) {
                score += 2;
                reasons.push('Currently active');
            }
            
            // Bonus pentru rating vânzător
            if (simAuction.createdBy?.averageRating >= 4) {
                score += 1;
                reasons.push('Highly rated seller');
            }
            
            // Bonus pentru licitații cu bid-uri
            if (simAuction.currentBid > simAuction.startingBid) {
                score += 1;
                reasons.push('Popular auction');
            }
            
            return {
                ...simAuction,
                similarityScore: score,
                similarityReasons: reasons,
                isActive: isActive,
                timeRemaining: isActive ? new Date(simAuction.endTime) - now : 0
            };
        });
        
        // STEP 6: Sortează și filtrează rezultatele
        const topSimilar = scoredAuctions
            .filter(auction => auction.similarityScore > 0) // Doar cu scor pozitiv
            .sort((a, b) => {
                // Prioritatea 1: scor de similaritate
                if (b.similarityScore !== a.similarityScore) {
                    return b.similarityScore - a.similarityScore;
                }
                // Prioritatea 2: licitații active
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                // Prioritatea 3: timp rămas (mai puțin timp = mai urgent)
                return a.timeRemaining - b.timeRemaining;
            })
            .slice(0, 8); // Limitează la 8 recomandări
        
        console.log('🏆 Final similar auctions:', topSimilar.length);
        
        if (topSimilar.length > 0) {
            console.log('🏆 Top recommendations:');
            topSimilar.slice(0, 3).forEach((auction, index) => {
                console.log(`${index + 1}. "${auction.title}" - Score: ${auction.similarityScore} - Reasons: ${auction.similarityReasons.join(', ')}`);
            });
        }
        
        res.status(200).json({
            success: true,
            similarAuctions: topSimilar,
            totalFound: similarAuctions.length,
            strategy: strategy,
            debug: {
                currentAuction: {
                    title: auction.title,
                    category: auction.category,
                    condition: auction.condition
                },
                stats: {
                    totalOtherAuctions: allAuctions.length,
                    sameCategoryTotal: sameCategoryAuctions.length,
                    sameCategoryActive: activeSameCategoryAuctions.length,
                    foundSimilar: similarAuctions.length,
                    returnedTop: topSimilar.length
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error in getSimilarAuctions:', error);
        return next(new ErrorHandler(error.message || "Failed to find similar auctions", 500));
    }
});

