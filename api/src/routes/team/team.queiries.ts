import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import teamController from '../../controllers/teamControllers/team.controller';

const { getTeamStats, getReferralLink, getTeamMembersByLevel } = teamController;

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
};
