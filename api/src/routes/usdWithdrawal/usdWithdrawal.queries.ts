// routes/usdWithdrawal/usdWithdrawal.queries.ts
import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import usdWithdrawalController from '../../controllers/usdWithdrawalControllers/usdWithdrawal.controller';

const {
  // User endpoints
  getUSDWalletInfo,
  saveBitgetWalletAddress,
  getWithdrawalMethods,
  createStripeConnectAccount,
  checkStripeConnectStatus,
  createUSDWithdrawal,
  getUSDWithdrawalHistory,
  getUSDTransactionHistory,
  // Admin endpoints
  getWithdrawalSettingsAdmin,
  updateWithdrawalSettings,
  testBitgetConnection,
  toggleUSDUserStatus,
  fundUSDWallet,
  getAllUSDWithdrawals,
  approveUSDWithdrawal,
  rejectUSDWithdrawal,
  getUSDWalletByUserId,
  checkBitgetWithdrawalStatus,
} = usdWithdrawalController;

export default (router: Router) => {
  // ========== USER ROUTES ==========
  
  // Get USD wallet info
  router.get(
    '/wallet',
    commonsMiddleware.checkUserAuth,
    getUSDWalletInfo
  );

  // Get USD wallet info (alias for frontend compatibility)
  router.get(
    '/wallet-info',
    commonsMiddleware.checkUserAuth,
    getUSDWalletInfo
  );

  // Get available withdrawal methods
  router.get(
    '/withdrawal-methods',
    commonsMiddleware.checkUserAuth,
    getWithdrawalMethods
  );

  // Save Bitget wallet address
  router.post(
    '/bitget-wallet',
    commonsMiddleware.checkUserAuth,
    saveBitgetWalletAddress
  );

  // Save wallet address (alias for backward compatibility)
  router.post(
    '/binance-wallet',
    commonsMiddleware.checkUserAuth,
    saveBitgetWalletAddress
  );

  // Create Stripe Connect account
  router.post(
    '/stripe-connect',
    commonsMiddleware.checkUserAuth,
    createStripeConnectAccount
  );

  // Check Stripe Connect status
  router.get(
    '/stripe-connect/status',
    commonsMiddleware.checkUserAuth,
    checkStripeConnectStatus
  );

  // Check Stripe Connect status (alias for frontend compatibility)
  router.get(
    '/check-connect-status',
    commonsMiddleware.checkUserAuth,
    checkStripeConnectStatus
  );

  // Create Stripe Connect account (alias for frontend compatibility)
  router.post(
    '/create-connect-account',
    commonsMiddleware.checkUserAuth,
    createStripeConnectAccount
  );

  // Create USD withdrawal request
  router.post(
    '/create',
    commonsMiddleware.checkUserAuth,
    createUSDWithdrawal
  );

  // Get USD withdrawal history
  router.get(
    '/history',
    commonsMiddleware.checkUserAuth,
    getUSDWithdrawalHistory
  );

  // Get USD wallet transaction history
  router.get(
    '/transactions',
    commonsMiddleware.checkUserAuth,
    getUSDTransactionHistory
  );

  // ========== ADMIN ROUTES ==========

  // Get withdrawal settings
  router.get(
    '/admin/settings',
    commonsMiddleware.checkAdminAuth,
    getWithdrawalSettingsAdmin
  );

  // Update withdrawal settings
  router.put(
    '/admin/settings',
    commonsMiddleware.checkAdminAuth,
    updateWithdrawalSettings
  );

  // Test Bitget connection
  router.get(
    '/admin/test-bitget',
    commonsMiddleware.checkAdminAuth,
    testBitgetConnection
  );

  // Test connection (alias for backward compatibility)
  router.get(
    '/admin/test-binance',
    commonsMiddleware.checkAdminAuth,
    testBitgetConnection
  );

  // Toggle USD user status
  router.patch(
    '/admin/users/:userId/toggle-usd',
    commonsMiddleware.checkAdminAuth,
    toggleUSDUserStatus
  );

  // Fund user's USD wallet
  router.post(
    '/admin/users/:userId/fund-wallet',
    commonsMiddleware.checkAdminAuth,
    fundUSDWallet
  );

  // Get USD wallet for a user
  router.get(
    '/admin/users/:userId/wallet',
    commonsMiddleware.checkAdminAuth,
    getUSDWalletByUserId
  );

  // Get all USD withdrawals
  router.get(
    '/admin/withdrawals',
    commonsMiddleware.checkAdminAuth,
    getAllUSDWithdrawals
  );

  // Approve USD withdrawal
  router.patch(
    '/admin/withdrawals/:withdrawalId/approve',
    commonsMiddleware.checkAdminAuth,
    approveUSDWithdrawal
  );

  // Reject USD withdrawal
  router.patch(
    '/admin/withdrawals/:withdrawalId/reject',
    commonsMiddleware.checkAdminAuth,
    rejectUSDWithdrawal
  );

  // Check Bitget withdrawal status
  router.get(
    '/admin/withdrawals/:withdrawalId/bitget-status',
    commonsMiddleware.checkAdminAuth,
    checkBitgetWithdrawalStatus
  );

  // Check withdrawal status (alias for backward compatibility)
  router.get(
    '/admin/withdrawals/:withdrawalId/binance-status',
    commonsMiddleware.checkAdminAuth,
    checkBitgetWithdrawalStatus
  );
};
    