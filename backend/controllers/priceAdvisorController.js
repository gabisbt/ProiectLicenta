import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const getPriceAdvice = catchAsyncErrors(async (req, res, next) => {
    const { query, productTitle, productDescription, currentBid, condition } = req.body;
    
    if (!productTitle || !currentBid || !condition) {
        return next(new ErrorHandler("Missing required information", 400));
    }
    
    try {
        const similarAuctions = await Auction.find({
            $or: [
                { title: { $regex: new RegExp(productTitle.split(' ')[0], 'i') } },
                { category: { $regex: new RegExp(productTitle.split(' ')[0], 'i') } }
            ],
            condition: condition,
            endTime: { $lt: new Date() },   
            highestBidder: { $exists: true, $ne: null }
        }).sort({ endTime: -1 }).limit(15);
        
        let priceRange = { low: 0, high: 0, average: 0, median: 0 };
        
        if (similarAuctions.length > 0) {
            const prices = similarAuctions.map(auction => parseFloat(auction.currentBid));
            prices.sort((a, b) => a - b);
            
            priceRange.low = Math.min(...prices);
            priceRange.high = Math.max(...prices);
            priceRange.average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            
            const middleIndex = Math.floor(prices.length / 2);
            priceRange.median = prices.length % 2 === 0
                ? (prices[middleIndex - 1] + prices[middleIndex]) / 2
                : prices[middleIndex];
        } else {
            priceRange.low = parseFloat(currentBid) * 0.8;
            priceRange.high = parseFloat(currentBid) * 1.2;
            priceRange.average = parseFloat(currentBid);
            priceRange.median = parseFloat(currentBid);
        }
        
        Object.keys(priceRange).forEach(key => {
            priceRange[key] = Math.round(priceRange[key] * 100) / 100;
        });
        
        const similarListings = similarAuctions.slice(0, 5).map(auction => ({
            title: auction.title,
            condition: auction.condition,
            finalPrice: auction.currentBid,
            endDate: new Date(auction.endTime).toLocaleDateString('ro-RO')
        }));
        
        const priceKeywords = [
            'pret', 'pret', 'cost', 'val', 'merita', 'bun', 'scump', 'ieftin', 
            'licitati', 'cumpar', 'maxim', 'platesc', 'platesc', 'oferta', 
            'oferta', 'bid', 'licitez', 'worth', 'cumpar', 'cumpar', 
            'recomand', 'sugerez', 'cat', 'cat', 'suma', 'bani', 
            'corect', 'decent', 'rezonabil', 'avantajos'
        ];
        
        const hasAuctionContext = priceKeywords.some(keyword => 
            query.toLowerCase().includes(keyword)
        );
        
        const auctionQuestions = [
            'ar trebui sa', 'merit', 'sa cumpar', 'sa cumpar', 
            'sa licitez', 'o idee buna', 'se merita', 'investesc',
            'sa investesc', 'sa dau', 'sa platesc', 'sa platesc'
        ];
        
        const isAuctionQuestion = auctionQuestions.some(phrase => 
            query.toLowerCase().includes(phrase)
        );
        
        const isGeneralQuestion = !hasAuctionContext && !isAuctionQuestion;
        
        let aiPrompt;
        
        if (isGeneralQuestion) {
            aiPrompt = `
            Esti un asistent prietenos pentru o platforma de licitatii online.
            Utilizatorul te-a intrebat: "${query}"

            Raspunde la intrebarea utilizatorului intr-un mod prietenos si util.
            Daca intrebarea nu are legatura cu licitatiile, raspunde politicos si incearca sa ii explici ca esti specializat in sfaturi despre licitatii si evaluarea preturilor.

            Exemplu de raspuns pentru intrebari ne-relevante: "Salut! intrebarea ta nu pare sa aiba legatura cu licitatiile. Eu sunt specializat in a te ajuta sa evaluezi daca preturile la licitatii sunt corecte. Ai vreo intrebare despre ${productTitle} sau despre alte licitatii?"

            Raspunde in limba romana, maxim 100 de cuvinte.`;
        } else {
            aiPrompt = `
                Esti un expert in evaluarea valorii produselor pentru licitatii online.
        Ofera sfaturi profesionale despre valoarea corecta a produselor bazandu-te pe datele de piata.
        Vezi daca poti sa gasesti informatii despre preturile de licitatie pentru produse similare.
        Raspunde la intrebarea utilizatorului despre produsul "${productTitle}" in contextul licitatiei.
        Raspunde in limba romana, intr-un stil prietenos dar profesionist.

        CONTEXTUL LICITATIEI:
        Utilizatorul se afla pe pagina produsului "${productTitle}" si intreaba: "${query}"

        ANALIZA PRODUSULUI:
        Titlu: ${productTitle}
        Descriere: ${productDescription || "Nu este disponibila"}
        Conditie: ${condition}
        Pret curent: ${currentBid} RON

        STATISTICI DE PIATA:
        - Pret minim observat: ${priceRange.low} RON
        - Pret mediu: ${priceRange.average} RON  
        - Pret median: ${priceRange.median} RON
        - Pret maxim observat: ${priceRange.high} RON
        - Produse similare analizate: ${similarAuctions.length}

        ${similarListings.length > 0 ? `EXEMPLE DE PRODUSE SIMILARE VaNDUTE:
        ${similarListings.map(item => `• "${item.title}" (${item.condition}) - ${item.finalPrice} RON - ${item.endDate}`).join('\n')}` : ''}

        INSTRUCTIUNI:
        Raspunde DIRECT la intrebarea utilizatorului despre acest produs specific.
        Pentru intrebari despre pret maxim, recomanda o suma concreta bazata pe statisticile de piata.
        Include in raspuns:
        1. Raspunsul direct la intrebarea utilizatorului
        2. Evaluarea valorii pentru acest produs specific
        3. Recomandarea ta despre suma maxima de platit
        4. Justificarea bazata pe datele de piata

        Raspunde concis in maxim 150 de cuvinte.
        Daca nu ai suficiente informatii, explica ca nu poti oferi o evaluare precisa.
        `;
        }
        
        try {
            const modelsToTry = ["gemini-1.5-flash"];
            
            let aiResponse = null;
            let modelUsed = null;
            
            for (const modelName of modelsToTry) {
                try {
                    const freshGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                    const model = freshGenAI.getGenerativeModel({ 
                        model: modelName
                    });
                    
                    const result = await model.generateContent(aiPrompt);
                    aiResponse = result.response.text();
                    modelUsed = modelName;
                    break;
                    
                } catch (modelError) {
                    continue;
                }
            }
            
            if (!aiResponse) {
                throw new Error("AI model failed");
            }
            
            if (isGeneralQuestion) {
                res.json({ 
                    success: true,
                    response: aiResponse,
                    type: "general_question",
                    productInfo: {
                        title: productTitle,
                        currentBid,
                        condition
                    },
                    aiGenerated: true,
                    modelUsed
                });
                return;
            }
            
            const currentBidValue = parseFloat(currentBid);
            let evaluation = "neutral";
            
            if (currentBidValue <= priceRange.low) {
                evaluation = "excellent_deal";
            } else if (currentBidValue <= priceRange.median) {
                evaluation = "good_deal";
            } else if (currentBidValue <= priceRange.average) {
                evaluation = "fair_price";
            } else if (currentBidValue <= priceRange.high) {
                evaluation = "high_price";
            } else {
                evaluation = "overpriced";
            }
            
            const confidenceLevel = similarAuctions.length > 10 ? "ridicat" : 
                                   similarAuctions.length > 5 ? "moderat" : "scazut";
            
            res.json({ 
                success: true,
                response: aiResponse,
                type: "price_analysis",
                priceAnalysis: {
                    evaluation,
                    confidenceLevel,
                    currentBid: currentBidValue,
                    priceRange,
                    similarAuctionsCount: similarAuctions.length,
                    recommendedMaxPrice: priceRange.median
                },
                similarListings: similarListings.slice(0, 3),
                aiGenerated: true,
                modelUsed
            });
            
        } catch (aiError) {
            console.error('Google AI API error:', aiError);
        
            if (isGeneralQuestion) {
                res.json({
                    success: true,
                    response: `Salut! intrebarea "${query}" nu pare sa aiba legatura cu licitatiile. Eu sunt specializat in a te ajuta sa evaluezi daca preturile la licitatii sunt corecte. Ai vreo intrebare despre "${productTitle}" sau despre alte licitatii?`,
                    type: "general_question",
                    aiGenerated: false,
                    fallbackUsed: true
                });
                return;
            }
            
            const fallbackResponse = generateFallbackResponse(
                query, productTitle, condition, parseFloat(currentBid), 
                priceRange, similarAuctions.length
            );
            
            res.json({ 
                success: true,
                response: fallbackResponse.response,
                type: "price_analysis",
                priceAnalysis: fallbackResponse.analysis,
                similarListings: similarListings.slice(0, 3),
                aiGenerated: false,
                fallbackUsed: true
            });
        }
        
    } catch (error) {
        console.error('Price advisor error:', error);
        return next(new ErrorHandler("Failed to generate price advice: " + error.message, 500));
    }
});
