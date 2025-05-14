//Sunt definite rutele pentru gestionarea produselor din licitatii. Aceste rute sunt protejate de middleware-uri de autentificare si autorizare pt a asigura 
//ca doar utilizatorii autentificati si autorizati pot accesa aceste rute. Rutele sunt definite in functie de metodele controller-ului aferent.

import {addNewAuctionItem, getAllItems, getAuctionDetails, getMyAuctionItems, removeFromAuction, republishItem, getUnpaidCommission, getWonAuctions} from "../controllers/auctionItemController.js";
import {isAuthenticated, isAuthorized} from "../middlewares/auth.js";
import express from "express";
import { trackCommissionStatus } from "../middlewares/trackCommissionStatus.js";

const router = express.Router();

router.post("/create", isAuthenticated, isAuthorized("Auctioneer"), trackCommissionStatus, addNewAuctionItem);

router.get("/allitems", getAllItems);

router.get("/auction/:id", isAuthenticated, getAuctionDetails);

router.get("/myitems", isAuthenticated, isAuthorized("Auctioneer"), getMyAuctionItems);

router.delete("/delete/:id", isAuthenticated, isAuthorized("Auctioneer"), removeFromAuction);

router.put("/item/republish/:id", isAuthenticated, isAuthorized("Auctioneer"), republishItem);

router.get("/won-auctions", isAuthenticated, getWonAuctions);

export default router;