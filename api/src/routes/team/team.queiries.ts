import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import teamController from '../../controllers/teamControllers/team.controller';

const {
  getTeamStats,
  getReferralLink,
  getTeamMembersByLevel,
  getAllTeamReferrals,
  getReferralTree,
  getTeamStatistics,
  getTeamReferralHistory,
} = teamController;

export default (router: Router) => {
  router.get('/stats', commonsMiddleware.checkUserAuth, getTeamStats);

  router.get(
    '/referral-link',
    commonsMiddleware.checkUserAuth,
    getReferralLink,
  );

  router.get(
    '/members/:level',
    commonsMiddleware.checkUserAuth,
    getTeamMembersByLevel,
  );

  router.get(
    '/referral-history',
    commonsMiddleware.checkUserAuth,
    getTeamReferralHistory,
  );

  router.get(
    '/admin/team/referrals',
    commonsMiddleware.checkAdminAuth,
    getAllTeamReferrals,
  );

  router.get(
    '/admin/team/statistics',
    commonsMiddleware.checkAdminAuth,
    getTeamStatistics,
  );

  router.get(
    '/admin/team/tree/:userId',
    commonsMiddleware.checkAdminAuth,
    getReferralTree,
  );
};
