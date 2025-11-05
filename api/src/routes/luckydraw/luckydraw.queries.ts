import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import luckydrawController from "../../controllers/luckyDrawControllers/luckydraw.controller";
import {
  uploadLuckyDrawImage,
  handleMulterError,
} from "../../middleware/upload.middleware";

const {
  createLuckyDraw,
  deleteLuckyDraw,
  getActiveLuckyDraws,
  getAllLuckyDraws,
  getLuckyDrawDetails,
  participateInLuckyDraw,
  selectWinners,
  toggleLuckyDrawStatus,
} = luckydrawController;

export default (router: Router) => {
  // 🟢 Public or User routes
  router.get("/active", commonsMiddleware.checkUserAuth, getActiveLuckyDraws);

  router.get(
    "/details/:drawId",
    commonsMiddleware.checkUserAuth,
    getLuckyDrawDetails
  );

  router.post(
    "/participate/:drawId",
    commonsMiddleware.checkUserAuth,
    participateInLuckyDraw
  );

  // 🟣 Admin routes
  router.post(
    "/admin/upload-image",
    commonsMiddleware.checkUserAuth,
    uploadLuckyDrawImage,
    handleMulterError,
    uploadLuckyDrawImage
  );

  router.post(
    "/create",
    commonsMiddleware.checkUserAuth,
    createLuckyDraw
  );

  router.get(
    "/all",
    commonsMiddleware.checkUserAuth,
    getAllLuckyDraws
  );

  router.delete(
    "/delete/:drawId",
    commonsMiddleware.checkUserAuth,
    deleteLuckyDraw
  );

  router.patch(
    "/toggle-status/:drawId",
    commonsMiddleware.checkUserAuth,
    toggleLuckyDrawStatus
  );

  router.post(
    "/select-winners/:drawId",
    commonsMiddleware.checkUserAuth,
    selectWinners
  );

  router.get(
    "/details/:drawId",
    commonsMiddleware.checkUserAuth,
    getLuckyDrawDetails
  );

  return router;
};
