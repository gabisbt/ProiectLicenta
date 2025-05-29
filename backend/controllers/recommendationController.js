import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { Favorite } from "../models/favoriteSchema.js";
import { Bid } from "../models/bidSchema.js";

// Obține recomandări personalizate de licitații pentru un utilizator
export const getPersonalizedRecommendations = catchAsyncErrors(async (req, res, next) => {
    console.log("🎯 Starting personalized recommendations for user:", req.user._id);
    
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

        // 2. Analizează preferințele utilizatorului cu scoring advanced
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

        // 8. Găsește licitații disponibile - VERSIUNEA RELAXATĂ
        const now = new Date();

        // STRATEGIE MULTIPLĂ pentru a găsi licitații
        let availableAuctions = [];
        let searchStrategy = '';

        // Strategia 1: Încearcă licitații ACTIVE
        const activeAuctions = await Auction.find({
            createdBy: { $ne: userId },
            endTime: { $gt: now },
            startTime: { $lte: now }
        })
        .populate('createdBy', 'userName averageRating')
        .lean();

        console.log("🔍 Active auctions found:", activeAuctions.length);

        if (activeAuctions.length >= 5) {
            availableAuctions = activeAuctions;
            searchStrategy = 'active_only';
        } else {
            // Strategia 2: Include și licitațiile VIITOARE
            const futureAuctions = await Auction.find({
                createdBy: { $ne: userId },
                startTime: { $gt: now }
            })
            .populate('createdBy', 'userName averageRating')
            .lean();
            
            console.log("🔍 Future auctions found:", futureAuctions.length);
            
            availableAuctions = [...activeAuctions, ...futureAuctions];
            searchStrategy = 'active_and_future';
            
            // Strategia 3: Dacă tot nu sunt suficiente, include TOATE (inclusiv terminate recent)
            if (availableAuctions.length < 10) {
                const allRecentAuctions = await Auction.find({
                    createdBy: { $ne: userId },
                    endTime: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Ultimele 7 zile
                })
                .populate('createdBy', 'userName averageRating')
                .lean();
                
                console.log("🔍 All recent auctions found:", allRecentAuctions.length);
                availableAuctions = allRecentAuctions;
                searchStrategy = 'all_recent';
            }
        }

        console.log("📋 Available auctions with strategy '" + searchStrategy + "':", availableAuctions.length);
        console.log("📊 Sample auctions:", availableAuctions.slice(0, 3).map(a => ({
            title: a.title,
            category: a.category,
            condition: a.condition,
            startingBid: a.startingBid,
            currentBid: a.currentBid,
            startTime: a.startTime,
            endTime: a.endTime,
            isActive: now >= new Date(a.startTime) && now <= new Date(a.endTime),
            isFuture: now < new Date(a.startTime),
            isEnded: now > new Date(a.endTime)
        })));

        // Calculează scorurile cu debugging
        const recommendations = [];
        let scoreDetails = [];

        availableAuctions.forEach((auction, index) => {
            const score = calculatePersonalizedScore(auction, userProfile, pricePreferences);
            
            scoreDetails.push({
                title: auction.title,
                category: auction.category,
                score: score.total,
                reasons: score.reasons
            });

            if (score.total > 0) { // Temporar: acceptă orice scor pozitiv
                recommendations.push({
                    ...auction,
                    recommendationScore: score.total,
                    recommendationReasons: score.reasons,
                    personalizedRank: score.rank
                });
            }

            // Log primele 5 pentru debugging
            if (index < 5) {
                console.log(`🎯 Auction "${auction.title}": Score ${score.total}, Reasons: ${score.reasons.join(', ')}`);
            }
        });

        console.log("📊 Scoring results:", {
            totalAuctions: availableAuctions.length,
            scoredPositive: recommendations.length,
            averageScore: scoreDetails.reduce((sum, s) => sum + s.score, 0) / scoreDetails.length
        });

        // Sortează și limitează
        const finalRecommendations = recommendations
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 20);

        console.log("🏆 Final recommendations:", finalRecommendations.length);

        res.status(200).json({
            success: true,
            recommendations: finalRecommendations,
            userProfile: {
                activityLevel: userProfile.activityLevel,
                spendingPattern: userProfile.spendingPattern,
                topCategories: Array.from(userProfile.categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
            },
            debug: {
                availableAuctions: availableAuctions.length,
                scoredRecommendations: recommendations.length,
                finalCount: finalRecommendations.length,
                sampleScores: scoreDetails.slice(0, 5)
            }
        });
        
    } catch (error) {
        console.error("❌ Error in getPersonalizedRecommendations:", error);
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

    console.log(`\n🎯 Scoring auction: "${auction.title}" (${auction.category})`);

    // 1. Categoria - MULT MAI PERMISIV
    const categoryScore = userProfile.categories.get(auction.category) || 0;
    console.log(`   📂 Category "${auction.category}": ${categoryScore} interactions`);
    
    if (categoryScore > 0) {
        const categoryPoints = Math.min(categoryScore * 3, 30); // Mărește multiplicatorul
        score += categoryPoints;
        reasons.push(`Interested in ${auction.category} (+${categoryPoints})`);
        
        if (categoryScore >= 3) rank = 'highly_recommended'; // Scade pragul
    } else {
        // Bonus pentru diversificare - IMPORTANT!
        score += 5;
        reasons.push(`New category: ${auction.category} (+5)`);
    }

    // 2. Condiția - MULT MAI TOLERANT
    const conditionScore = userProfile.conditions.get(auction.condition) || 0;
    console.log(`   🔧 Condition "${auction.condition}": ${conditionScore} interactions`);
    
    if (conditionScore > 0) {
        const conditionPoints = Math.min(conditionScore * 2, 15); // Mărește
        score += conditionPoints;
        reasons.push(`Prefers ${auction.condition} (+${conditionPoints})`);
    } else {
        // Bonus pentru încercare de condiții noi
        score += 3;
        reasons.push(`Try ${auction.condition} condition (+3)`);
    }

    // 3. Preț - FOARTE TOLERANT
    const currentPrice = auction.currentBid || auction.startingBid;
    console.log(`   💰 Price ${currentPrice} vs range ${pricePreferences.min}-${pricePreferences.max}`);
    
    if (currentPrice >= pricePreferences.min && currentPrice <= pricePreferences.max) {
        score += 20;
        reasons.push(`Perfect price range (+20)`);
    } else if (currentPrice < pricePreferences.min) {
        score += 15; // Mare bonus pentru oferte
        reasons.push(`Great deal! Below your usual range (+15)`);
    } else if (currentPrice <= pricePreferences.max * 1.5) { // 50% toleranță
        score += 10;
        reasons.push(`Slightly above range but worth it (+10)`);
    } else {
        score += 2; // Măcar ceva pentru toate
        reasons.push(`Higher price (+2)`);
    }

    // 4. BONUS DE BAZĂ pentru toate licitațiile - CRUCIAL!
    score += 8;
    reasons.push(`Available auction (+8)`);

    // 5. Vânzător
    if (userProfile.preferredSellers.has(auction.createdBy._id.toString())) {
        score += 12;
        reasons.push(`Trusted seller (+12)`);
        rank = 'highly_recommended';
    }

    // 6. Rating vânzător
    if (auction.createdBy.averageRating) {
        const ratingPoints = Math.floor(auction.createdBy.averageRating * 2);
        score += ratingPoints;
        reasons.push(`Seller: ${auction.createdBy.averageRating}★ (+${ratingPoints})`);
    } else {
        score += 2; // Bonus pentru vânzători noi
        reasons.push(`New seller (+2)`);
    }

    // 7. Activitate licitație
    if (auction.currentBid > auction.startingBid) {
        score += 5;
        reasons.push(`Popular auction (+5)`);
    } else {
        score += 2;
        reasons.push(`New auction opportunity (+2)`);
    }

    // 8. Timing
    const timeLeft = new Date(auction.endTime) - new Date();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 24 && hoursLeft > 1) {
        score += 8;
        reasons.push(`Ending soon - act fast! (+8)`);
    } else if (hoursLeft >= 24) {
        score += 4;
        reasons.push(`Plenty of time (+4)`);
    }

    console.log(`   ⭐ Final score: ${score.toFixed(1)}`);

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

// Adaugă în recommendationController.js:

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
        
        // Sample licitații
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

