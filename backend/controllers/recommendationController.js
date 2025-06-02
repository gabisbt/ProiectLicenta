import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { Favorite } from "../models/favoriteSchema.js";
import { Bid } from "../models/bidSchema.js";

// Obtine recomandari personalizate de licitatii pentru un utilizator
export const getPersonalizedRecommendations = catchAsyncErrors(async (req, res, next) => {
    console.log("Starting personalized recommendations for user:", req.user._id);
    
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        console.log("👤 User data:", {
            userName: user.userName,
            role: user.role,
            favoriteAuctions: user.favoriteAuctions?.length || 0,
            wonAuctionsDetails: user.wonAuctionsDetails?.length || 0,
            moneySpent: user.moneySpent || 0
        });

        // 1. Obtine istoricul utilizatorului
        const userFavoritesRaw = await Favorite.find({ user: userId }).populate('auction');
        const userFavorites = userFavoritesRaw.filter(fav => fav.auction && fav.auction._id);
        
        // Elimina duplicatele
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
        
        // 2. CONSTRUIEsTE PROFILUL UTILIZATORULUI
        const userProfile = {
            categories: new Map(),
            conditions: new Map(),
            priceRanges: [],
            preferredSellers: new Set(),
            timePreferences: new Map(),
            brandPreferences: new Map(),
            activityHours: new Map(),
            searchPatterns: new Map(),
            locationPreferences: new Set(),
            lastActivityDate: null,
            totalInteractions: 0,
            diversityScore: 0,
            averagePrice: 0,
            preferredTimeSlot: 12,
            userType: 'casual_user'
        };

        // 3. Analizeaza favoritele (weight: 3x)
        uniqueFavorites.forEach(fav => {
            if (fav.auction) {
                const auction = fav.auction;
                console.log("Processing favorite:", auction.title, auction.category);
                
                // Categoria
                const category = auction.category || 'unknown';
                userProfile.categories.set(category, (userProfile.categories.get(category) || 0) + 3);
                
                // Conditia
                const condition = auction.condition || 'unknown';
                userProfile.conditions.set(condition, (userProfile.conditions.get(condition) || 0) + 3);
                
                // Vanzatorul preferat
                if (auction.createdBy) {
                    userProfile.preferredSellers.add(auction.createdBy.toString());
                }
                
                // Ora adaugarii la favorite
                const hour = new Date(fav.createdAt || Date.now()).getHours();
                userProfile.activityHours.set(hour, (userProfile.activityHours.get(hour) || 0) + 1);
            }
        });

        // 4. Analizeaza licitatiile utilizatorului (weight: 2x)
        userBids.forEach(bid => {
            if (bid.auctionItem) {
                const auction = bid.auctionItem;
                console.log("Processing bid:", auction.title, auction.category);
                
                const category = auction.category || 'unknown';
                const condition = auction.condition || 'unknown';
                
                userProfile.categories.set(category, (userProfile.categories.get(category) || 0) + 2);
                userProfile.conditions.set(condition, (userProfile.conditions.get(condition) || 0) + 2);
                userProfile.priceRanges.push(bid.amount);
                
                if (bid.amount >= auction.startingBid * 1.2) {
                    userProfile.preferredSellers.add(auction.createdBy.toString());
                }
                
                const bidHour = new Date(bid.placedAt).getHours();
                userProfile.activityHours.set(bidHour, (userProfile.activityHours.get(bidHour) || 0) + 1);
                
                if (!userProfile.lastActivityDate || bid.placedAt > userProfile.lastActivityDate) {
                    userProfile.lastActivityDate = bid.placedAt;
                }
            }
        });

        // 5. Analizeaza licitatiile castigate (weight: 4x)
        if (user?.wonAuctionsDetails) {
            user.wonAuctionsDetails.forEach(won => {
                console.log("Processing won auction:", won.title);
                
                const category = won.category || 'unknown';
                const condition = won.condition || 'unknown';
                
                userProfile.categories.set(category, (userProfile.categories.get(category) || 0) + 4);
                userProfile.conditions.set(condition, (userProfile.conditions.get(condition) || 0) + 3);
                userProfile.priceRanges.push(won.finalBid);
                
                const winHour = new Date(won.wonAt).getHours();
                userProfile.activityHours.set(winHour, (userProfile.activityHours.get(winHour) || 0) + 2);
            });
        }

        // 6. Calculeaza statistici avansate
        userProfile.totalInteractions = Array.from(userProfile.categories.values())
            .reduce((sum, count) => sum + count, 0);
        
        userProfile.diversityScore = userProfile.categories.size;
        
        userProfile.averagePrice = userProfile.priceRanges.length > 0 
            ? userProfile.priceRanges.reduce((a, b) => a + b, 0) / userProfile.priceRanges.length 
            : 100; // Valoare default
        
        userProfile.preferredTimeSlot = Array.from(userProfile.activityHours.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

        // 7. Determina tipul de utilizator
        userProfile.userType = determineUserType(userProfile);

        // 8. CALCULEAZa PREFERINtELE DE PREt - FOARTE IMPORTANT!
        const activityLevel = determineActivityLevel(userBids.length, user?.wonAuctionsDetails?.length || 0);
        const spendingPattern = determineSpendingPattern(user.moneySpent || 0, userProfile.priceRanges);
        const pricePreferences = calculatePersonalizedPriceRange(userProfile.priceRanges, spendingPattern);

        console.log("User profile built:", {
            totalInteractions: userProfile.totalInteractions,
            categoriesCount: userProfile.categories.size,
            diversityScore: userProfile.diversityScore,
            averagePrice: userProfile.averagePrice,
            userType: userProfile.userType,
            activityLevel: activityLevel,
            spendingPattern: spendingPattern,
            pricePreferences: pricePreferences,
            topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
        });

        // 9. Gaseste licitatii disponibile - EXCLUDE LICITAtIILE CasTIGATE
        const now = new Date();
        let availableAuctions = [];
        let searchStrategy = '';

        // Obtine ID-urile licitatiilor castigate de utilizator
        const wonAuctionIds = (user?.wonAuctionsDetails || []).map(won => won.auctionId?.toString()).filter(Boolean);
        console.log("Excluding won auctions:", wonAuctionIds.length, wonAuctionIds);

        // Strategie multipla pentru a gasi licitatii (EXCLUDE cele castigate)
        const activeAuctions = await Auction.find({
            createdBy: { $ne: userId },
            _id: { $nin: wonAuctionIds }, // ← ADAUGa aceasta linie
            endTime: { $gt: now },
            startTime: { $lte: now }
        })
        .populate('createdBy', 'userName averageRating')
        .lean();

        console.log("Active auctions found (excluding won):", activeAuctions.length);

        if (activeAuctions.length >= 5) {
            availableAuctions = activeAuctions;
            searchStrategy = 'active_only';
        } else {
            const futureAuctions = await Auction.find({
                createdBy: { $ne: userId },
                _id: { $nin: wonAuctionIds }, // ← ADAUGa aceasta linie
                startTime: { $gt: now }
            })
            .populate('createdBy', 'userName averageRating')
            .lean();
            
            console.log("Future auctions found (excluding won):", futureAuctions.length);
            
            availableAuctions = [...activeAuctions, ...futureAuctions];
            searchStrategy = 'active_and_future';
            
            if (availableAuctions.length < 10) {
                const allRecentAuctions = await Auction.find({
                    createdBy: { $ne: userId },
                    _id: { $nin: wonAuctionIds }, // ← ADAUGa aceasta linie
                    endTime: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                })
                .populate('createdBy', 'userName averageRating')
                .lean();
                
                console.log("All recent auctions found (excluding won):", allRecentAuctions.length);
                availableAuctions = allRecentAuctions;
                searchStrategy = 'all_recent';
            }
        }

        console.log("Available auctions with strategy '" + searchStrategy + "' (excluding won):", availableAuctions.length);

        // 10. Calculeaza scorurile personalizate
        const recommendations = [];
        let scoreDetails = [];

        availableAuctions.forEach((auction, index) => {
            try {
                const score = calculatePersonalizedScore(auction, userProfile, pricePreferences);
                
                scoreDetails.push({
                    title: auction.title,
                    category: auction.category,
                    score: score.total,
                    reasons: score.reasons
                });

                if (score.total > 0) {
                    recommendations.push({
                        ...auction,
                        recommendationScore: score.total,
                        recommendationReasons: score.reasons,
                        personalizedRank: score.rank
                    });
                }

                if (index < 5) {
                    console.log(`Auction "${auction.title}": Score ${score.total}, Reasons: ${score.reasons.join(', ')}`);
                }
            } catch (scoreError) {
                console.error(`Error scoring auction ${auction.title}:`, scoreError);
            }
        });

        console.log("Scoring results:", {
            totalAuctions: availableAuctions.length,
            scoredPositive: recommendations.length,
            averageScore: scoreDetails.length > 0 ? (scoreDetails.reduce((sum, s) => sum + s.score, 0) / scoreDetails.length) : 0
        });

        // 11. Sorteaza si limiteaza
        const finalRecommendations = recommendations
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 20);

        console.log("Final recommendations:", finalRecommendations.length);

        res.status(200).json({
            success: true,
            recommendations: finalRecommendations,
            userProfile: {
                activityLevel: activityLevel,
                spendingPattern: spendingPattern,
                userType: userProfile.userType,
                topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
            },
            debug: {
                availableAuctions: availableAuctions.length,
                scoredRecommendations: recommendations.length,
                finalCount: finalRecommendations.length,
                sampleScores: scoreDetails.slice(0, 5),
                pricePreferences: pricePreferences
            }
        });
        
    } catch (error) {
        console.error("Error in getPersonalizedRecommendations:", error);
        return next(new ErrorHandler(error.message || "Failed to generate recommendations", 500));
    }
});

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
    
    // Ajusteaza intervalul in functie de pattern-ul de cheltuieli
    const expansion = spendingPattern === 'premium' ? 1.5 : spendingPattern === 'moderate' ? 1.2 : 0.8;
    
    return {
        min: Math.max(0, q1 - (iqr * expansion)),
        max: q3 + (iqr * expansion)
    };
}

//Scoring mai personal:
function calculatePersonalizedScore(auction, userProfile, pricePreferences) {
    let score = 0;
    const reasons = [];
    let rank = 'standard';

    console.log(`\nPersonalized scoring for "${auction.title}" (User: ${userProfile.userType})`);

    // 1. CATEGORIA - (40% din scor)
    const categoryInteractions = userProfile.categories.get(auction.category) || 0;
    const maxCategoryInteractions = Math.max(...Array.from(userProfile.categories.values()));
    
    if (categoryInteractions > 0) {
        // Scor proportional cu interactiunile
        const categoryScore = (categoryInteractions / Math.max(maxCategoryInteractions, 1)) * 40;
        score += categoryScore;
        
        if (categoryInteractions >= maxCategoryInteractions * 0.8) {
            reasons.push(`Your TOP category: ${auction.category} (${categoryInteractions} interactions)`);
            rank = 'highly_recommended';
        } else if (categoryInteractions >= maxCategoryInteractions * 0.5) {
            reasons.push(`Frequently interested in ${auction.category} (${categoryInteractions} times)`);
            rank = 'recommended';
        } else {
            reasons.push(`Some interest in ${auction.category} (${categoryInteractions} times)`);
        }
    } else {
        // Penalizare pentru categorii necunoscute (mai mica pentru exploratori)
        if (userProfile.userType === 'explorer') {
            score += 5;
            reasons.push(`New category to explore: ${auction.category}`);
        } else {
            score -= 5;
            reasons.push(`Unknown category: ${auction.category}`);
        }
    }

    // 2. CONDITIA - (15% din scor)
    const conditionInteractions = userProfile.conditions.get(auction.condition) || 0;
    const maxConditionInteractions = Math.max(...Array.from(userProfile.conditions.values()));
    
    if (conditionInteractions > 0) {
        const conditionScore = (conditionInteractions / Math.max(maxConditionInteractions, 1)) * 15;
        score += conditionScore;
        reasons.push(`You prefer ${auction.condition} condition (${conditionInteractions} times)`);
    } else {
        score -= 3;
        reasons.push(`Different condition than usual: ${auction.condition}`);
    }

    // 3. PRETUL - (25% din scor)
    const currentPrice = auction.currentBid || auction.startingBid;
    
    if (userProfile.userType === 'bargain_hunter') {
        // Pentru vanatorii de chilipiruri
        if (currentPrice <= userProfile.averagePrice * 0.7) {
            score += 30;
            reasons.push(`BARGAIN ALERT! Much cheaper than your usual ${userProfile.averagePrice.toFixed(0)} RON`);
            rank = 'hot_deal';
        } else if (currentPrice <= userProfile.averagePrice) {
            score += 15;
            reasons.push(`Good deal - within your budget`);
        } else {
            score -= 10;
            reasons.push(`Above your usual spending`);
        }
    } else if (userProfile.userType === 'premium_buyer') {
        // Pentru cumparatorii premium
        if (currentPrice >= userProfile.averagePrice * 0.8 && currentPrice <= userProfile.averagePrice * 1.3) {
            score += 25;
            reasons.push(`Premium quality in your price range`);
        } else if (currentPrice > userProfile.averagePrice * 1.3) {
            score += 10;
            reasons.push(`High-end option - worth considering`);
        } else {
            score += 5;
            reasons.push(`Lower price than usual - good value`);
        }
    } else {
        // Pentru alti utilizatori
        if (currentPrice >= pricePreferences.min && currentPrice <= pricePreferences.max) {
            score += 20;
            reasons.push(`Perfect price match for your budget`);
        } else if (currentPrice < pricePreferences.min) {
            score += 15;
            reasons.push(`Great deal - below your usual range`);
        } else {
            score -= 8;
            reasons.push(`Above your usual spending pattern`);
        }
    }
    // 4. VANZATORUL - (10% din scor)
    if (userProfile.preferredSellers.has(auction.createdBy._id.toString())) {
        score += 20;
        reasons.push(`Trusted seller from your history`);
        rank = 'highly_recommended';
    } else if (auction.createdBy.averageRating >= 4.5) {
        score += 8;
        reasons.push(`Excellent seller (${auction.createdBy.averageRating}★)`);
    } else if (auction.createdBy.averageRating >= 4.0) {
        score += 5;
        reasons.push(`Good seller (${auction.createdBy.averageRating}★)`);
    }

    // 5. TIMING PERSONAL (5% din scor)
    const currentHour = new Date().getHours();
    const userPreferredHour = userProfile.preferredTimeSlot;
    
    if (Math.abs(currentHour - userPreferredHour) <= 2) {
        score += 5;
        reasons.push(`Perfect timing - you're usually active now`);
    }

    // 6. BONUS PENTRU TIPUL DE UTILIZATOR (5% din scor)
    switch (userProfile.userType) {
        case 'power_user':
            if (auction.currentBid > auction.startingBid) {
                score += 8;
                reasons.push(`Popular auction - perfect for active users`);
            }
            break;
        case 'explorer':
            if (categoryInteractions === 0) {
                score += 10;
                reasons.push(`New category perfect for exploration`);
            }
            break;
        case 'regular_buyer':
            if (categoryInteractions > 0) {
                score += 5;
                reasons.push(`Matches your buying pattern`);
            }
            break;
    }

    // 7. SCOR FINAL DI RANKING
    score = Math.max(0, Math.round(score * 100) / 100);
    
    // Ajusteaza ranking-ul
    if (score >= 70) rank = 'must_see';
    else if (score >= 50) rank = 'highly_recommended';
    else if (score >= 30) rank = 'recommended';
    else if (score >= 15) rank = 'maybe_interesting';
    else rank = 'not_recommended';

    console.log(`Personal score: ${score}, Rank: ${rank}`);

    return {
        total: score,
        reasons,
        rank,
        userSpecific: true,
        confidenceLevel: Math.min(100, (userProfile.totalInteractions / 10) * 100)
    };
}

// Obtine recomandari simple bazate doar pe categoria licitatiei curente
export const getSimilarAuctions = catchAsyncErrors(async (req, res, next) => {
    const { auctionId } = req.params;
    
    console.log('getSimilarAuctions called for:', auctionId);
    
    try {
        // Gaseste licitatia curenta
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            console.log('Auction not found:', auctionId);
            return next(new ErrorHandler("Auction not found", 404));
        }
        
        console.log('Current auction:', {
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
        
        // STEP 1: Verifica toate licitatiile disponibile (pentru debugging)
        const allAuctions = await Auction.find({
            _id: { $ne: auctionId }
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log('Total other auctions in database:', allAuctions.length);
        
        // STEP 2: Licitatii din aceeasi categorie (fara restrictii de timp)
        const sameCategoryAuctions = await Auction.find({
            _id: { $ne: auctionId },
            category: auction.category
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log(`Auctions in "${auction.category}" category:`, sameCategoryAuctions.length);
        
        // STEP 3: Licitatii active din aceeasi categorie
        const activeSameCategoryAuctions = await Auction.find({
            _id: { $ne: auctionId },
            category: auction.category,
            endTime: { $gt: now }
        }).select('title category condition startingBid endTime startTime').lean();
        
        console.log(`Active auctions in "${auction.category}":`, activeSameCategoryAuctions.length);
        
        // STEP 4: Strategie multipla pentru a gasi recomandari
        let similarAuctions = [];
        let strategy = '';
        
        // Strategia 1: Licitatii active din aceeasi categorie
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
        // Strategia 2: Toate licitatiile din aceeasi categorie (chiar daca nu sunt active)
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
        // Strategia 3: Licitatii cu aceeasi conditie
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
        
        console.log(`Found ${similarAuctions.length} similar auctions using strategy: ${strategy}`);
        
        if (similarAuctions.length > 0) {
            console.log('Sample similar auctions:');
            similarAuctions.slice(0, 5).forEach((sim, index) => {
                const isActive = new Date(sim.endTime) > now;
                console.log(`${index + 1}. "${sim.title}" - ${sim.category} - ${sim.condition} - Active: ${isActive}`);
            });
        }
        
        // STEP 5: Calculeaza scoruri avansate de similaritate
        const scoredAuctions = similarAuctions.map(simAuction => {
            let score = 0;
            const reasons = [];
            
            // Categoria (cel mai important)
            if (simAuction.category === auction.category) {
                score += 10;
                reasons.push('Same category');
            }
            
            // Conditia
            if (simAuction.condition === auction.condition) {
                score += 5;
                reasons.push('Same condition');
            }
            
            // Intervalul de pret
            const priceDiff = Math.abs((simAuction.startingBid || 0) - auction.startingBid);
            const priceThreshold = auction.startingBid * 0.5;
            if (priceDiff <= priceThreshold) {
                score += 3;
                reasons.push('Similar price');
            } else if (priceDiff <= auction.startingBid) {
                score += 1;
                reasons.push('Comparable price');
            }
            
            // Bonus pentru licitatii active
            const isActive = new Date(simAuction.endTime) > now;
            if (isActive) {
                score += 2;
                reasons.push('Currently active');
            }
            
            // Bonus pentru rating vanzator
            if (simAuction.createdBy?.averageRating >= 4) {
                score += 1;
                reasons.push('Highly rated seller');
            }
            
            // Bonus pentru licitatii cu bid-uri
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
        
        // STEP 6: Sorteaza si filtreaza rezultatele
        const topSimilar = scoredAuctions
            .filter(auction => auction.similarityScore > 0) // Doar cu scor pozitiv
            .sort((a, b) => {
                // Prioritatea 1: scor de similaritate
                if (b.similarityScore !== a.similarityScore) {
                    return b.similarityScore - a.similarityScore;
                }
                // Prioritatea 2: licitatii active
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                // Prioritatea 3: timp ramas (mai putin timp = mai urgent)
                return a.timeRemaining - b.timeRemaining;
            })
            .slice(0, 8); // Limiteaza la 8 recomandari
        
        console.log('Final similar auctions:', topSimilar.length);
        
        if (topSimilar.length > 0) {
            console.log('Top recommendations:');
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
        console.error('Error in getSimilarAuctions:', error);
        return next(new ErrorHandler(error.message || "Failed to find similar auctions", 500));
    }
});

export const debugAuctions = catchAsyncErrors(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        
        // Statistici complete
        const totalAuctions = await Auction.countDocuments();
        const myAuctions = await Auction.countDocuments({ createdBy: userId });
        const othersAuctions = await Auction.countDocuments({ createdBy: { $ne: userId } });
        
        const activeAuctions = await Auction.countDocuments({
            createdBy: { $ne: userId },
            startTime: { $lte: now },
            endTime: { $gt: now }
        });
        
        const futureAuctions = await Auction.countDocuments({
            createdBy: { $ne: userId },
            startTime: { $gt: now }
        });
        
        const endedAuctions = await Auction.countDocuments({
            createdBy: { $ne: userId },
            endTime: { $lte: now }
        });
        
        // Sample licitatii
        const sampleAll = await Auction.find({ createdBy: { $ne: userId } })
            .select('title category startTime endTime createdBy')
            .limit(10)
            .lean();
        
        res.status(200).json({
            success: true,
            currentTime: now,
            userId: userId,
            statistics: {
                total: totalAuctions,
                mine: myAuctions,
                others: othersAuctions,
                othersActive: activeAuctions,
                othersFuture: futureAuctions,
                othersEnded: endedAuctions
            },
            sampleAuctions: sampleAll.map(auction => ({
                title: auction.title,
                category: auction.category,
                startTime: auction.startTime,
                endTime: auction.endTime,
                isActive: now >= new Date(auction.startTime) && now <= new Date(auction.endTime),
                isFuture: now < new Date(auction.startTime),
                isEnded: now > new Date(auction.endTime),
                isMyAuction: auction.createdBy.toString() === userId.toString()
            }))
        });
        
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//Modificare buildUserProfile sa colecteze mai multe date:

// function buildUserProfile(user, favoriteAuctions, userBids) {
//     console.log("Building detailed user profile...");
    
//     const userProfile = {
//         categories: new Map(),
//         conditions: new Map(),
//         priceRanges: [],
//         preferredSellers: new Set(),
//         timePreferences: new Map(),
//         brandPreferences: new Map(),
//         activityHours: new Map(),
//         searchPatterns: new Map(),
//         locationPreferences: new Set(),
//         lastActivityDate: null
//     };

//     // 1. ANALIZEAZa FAVORITELE (weight: 3x - foarte important)
//     const uniqueFavorites = [...new Set(user.favoriteAuctions || [])];
//     uniqueFavorites.forEach(favoriteId => {
//         const auction = favoriteAuctions.find(a => a._id.toString() === favoriteId.toString());
//         if (auction) {
//             // Categoria
//             userProfile.categories.set(auction.category, 
//                 (userProfile.categories.get(auction.category) || 0) + 3);
            
//             // Conditia
//             userProfile.conditions.set(auction.condition, 
//                 (userProfile.conditions.get(auction.condition) || 0) + 3);
            
//             // Vanzatorul preferat
//             userProfile.preferredSellers.add(auction.createdBy._id.toString());
            
//             // Ora adaugarii la favorite (pentru pattern-uri temporale)
//             const hour = new Date().getHours();
//             userProfile.activityHours.set(hour, 
//                 (userProfile.activityHours.get(hour) || 0) + 1);
//         }
//     });

//     // 2. ANALIZEAZa BID-URILE (weight: 2x)
//     userBids.forEach(bid => {
//         const auction = bid.auctionItem;
        
//         // Categoria
//         userProfile.categories.set(auction.category, 
//             (userProfile.categories.get(auction.category) || 0) + 2);
        
//         // Conditia
//         userProfile.conditions.set(auction.condition, 
//             (userProfile.conditions.get(auction.condition) || 0) + 2);
        
//         // Intervalul de pret
//         userProfile.priceRanges.push(bid.amount);
        
//         // Vanzatorul
//         if (bid.amount >= auction.startingBid * 1.2) { // Doar daca a licitat serios
//             userProfile.preferredSellers.add(auction.createdBy._id.toString());
//         }
        
//         // Pattern temporal
//         const bidHour = new Date(bid.placedAt).getHours();
//         userProfile.activityHours.set(bidHour, 
//             (userProfile.activityHours.get(bidHour) || 0) + 1);
        
//         // Ultima activitate
//         if (!userProfile.lastActivityDate || bid.placedAt > userProfile.lastActivityDate) {
//             userProfile.lastActivityDate = bid.placedAt;
//         }
//     });

//     // 3. ANALIZEAZa LICITAtIILE CasTIGATE (weight: 4x - cel mai important)
//     (user?.wonAuctionsDetails || []).forEach(won => {
//         // Categoria - cea mai importanta
//         userProfile.categories.set(won.category || 'unknown', 
//             (userProfile.categories.get(won.category || 'unknown') || 0) + 4);
        
//         // Pretul final platit
//         userProfile.priceRanges.push(won.finalBid);
        
//         // Pattern de timp cand cumpara
//         const winHour = new Date(won.wonAt).getHours();
//         userProfile.activityHours.set(winHour, 
//             (userProfile.activityHours.get(winHour) || 0) + 2);
//     });

//     // 4. CALCULEAZa STATISTICI AVANSATE
//     userProfile.totalInteractions = Array.from(userProfile.categories.values())
//         .reduce((sum, count) => sum + count, 0);
    
//     userProfile.diversityScore = userProfile.categories.size; // Cate categorii diferite
    
//     userProfile.averagePrice = userProfile.priceRanges.length > 0 
//         ? userProfile.priceRanges.reduce((a, b) => a + b, 0) / userProfile.priceRanges.length 
//         : 0;
    
//     userProfile.preferredTimeSlot = Array.from(userProfile.activityHours.entries())
//         .sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

//     // 5. DETERMINa TIPUL DE UTILIZATOR
//     userProfile.userType = determineUserType(userProfile);

//     console.log("User profile built:", {
//         totalInteractions: userProfile.totalInteractions,
//         categoriesCount: userProfile.categories.size,
//         diversityScore: userProfile.diversityScore,
//         averagePrice: userProfile.averagePrice,
//         userType: userProfile.userType,
//         topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
//     });

//     return userProfile;
// }

// Noua functie pentru determinarea tipului de utilizator
function determineUserType(userProfile) {
    const totalInteractions = userProfile.totalInteractions;
    const diversity = userProfile.diversityScore;
    const avgPrice = userProfile.averagePrice;

    if (totalInteractions > 50 && diversity > 5) return 'power_user';
    if (totalInteractions > 20 && avgPrice > 1000) return 'premium_buyer';
    if (diversity > 7) return 'explorer';
    if (totalInteractions > 15) return 'regular_buyer';
    if (avgPrice < 200) return 'bargain_hunter';
    return 'casual_user';
}


//Sistemul analizeaza comportamentul utilizatorului si ii ofera recomandari personalizate de licitatii pe baza da:
//preferinte: favorite, bid-uri, won-uri

