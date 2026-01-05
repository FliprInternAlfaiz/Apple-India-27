// services/bitget.service.ts
// Bitget API V2 Documentation: https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
import crypto from 'crypto';
import axios from 'axios';

// Bitget API configuration - Using V2 API
const BITGET_BASE_URL = 'https://api.bitget.com';

/**
 * Bitget API V2 Authentication Flow:
 * 1. Generate pre-hash string: timestamp + method.toUpperCase() + requestPath + queryString + body
 * 2. Sign with HMAC SHA256 using secretKey
 * 3. Base64 encode the signature
 * 
 * Required Headers:
 * - ACCESS-KEY: API Key
 * - ACCESS-SIGN: Base64 encoded signature
 * - ACCESS-TIMESTAMP: Unix timestamp in milliseconds
 * - ACCESS-PASSPHRASE: API passphrase set when creating API key
 * - Content-Type: application/json
 * - locale: en-US (optional)
 */

interface BitgetWithdrawParams {
  coin: string;
  chain: string; // Network chain (e.g., 'trc20', 'erc20', 'bep20')
  address: string;
  amount: number;
  clientOid?: string; // Client order ID for tracking
  tag?: string; // Address tag for networks like XRP, XLM
  remark?: string; // Withdrawal remark/description
}

interface BitgetWithdrawResponse {
  orderId: string;
  clientOrderId?: string;
  success: boolean;
  msg?: string;
}

interface BitgetBalanceResponse {
  coin: string;
  coinId?: string;
  coinName?: string;
  available: string;
  frozen: string;
  lock: string;
  limitAvailable?: string;
  uTime: string;
}

interface BitgetCoinNetwork {
  chain: string;
  needTag: string;
  withdrawable: string;
  rechargeable: string;
  withdrawFee: string;
  depositConfirm: string;
  withdrawConfirm: string;
  minDepositAmount: string;
  minWithdrawAmount: string;
  browserUrl: string;
}

interface BitgetCoinInfo {
  coinId: string;
  coinName: string;
  coinDisplayName: string;
  transfer: string;
  chains: BitgetCoinNetwork[];
}

interface BitgetAddressBookEntry {
  id: string;
  coin: string;
  address: string;
  chain: string;
  tag?: string;
  remark?: string;
}

interface BitgetAddAddressParams {
  coin: string;
  address: string;
  chain: string;
  tag?: string;
  remark?: string;
}

class BitgetService {
  private apiKey: string;
  private secretKey: string;
  private passphrase: string;
  private timeOffset: number = 0;
  private lastTimeSync: number = 0;

  constructor(apiKey?: string, secretKey?: string, passphrase?: string) {
    this.apiKey = process.env.BITGET_API_KEY || apiKey || "";
    this.secretKey = process.env.BITGET_SECRET_KEY || secretKey || "";
    this.passphrase =  process.env.BITGET_PASSPHRASE || passphrase || "";
  }

  /**
   * Update API credentials dynamically
   */
  setCredentials(apiKey: string, secretKey: string, passphrase: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.passphrase = passphrase;
  }

  /**
   * Get Bitget server time and calculate offset
   * V2 Endpoint: GET /api/v2/public/time
   */
  private async syncServerTime(): Promise<number> {
    try {
      const response = await axios.get(`${BITGET_BASE_URL}/api/v2/public/time`);
      if (response.data.code === '00000') {
        const serverTime = parseInt(response.data.data.serverTime);
        const localTime = Date.now();
        this.timeOffset = serverTime - localTime;
        this.lastTimeSync = Date.now();
        console.log(`Bitget time sync: offset = ${this.timeOffset}ms`);
        return serverTime;
      }
      return Date.now();
    } catch (error) {
      console.error('Failed to sync Bitget server time:', error);
      return Date.now();
    }
  }

  /**
   * Generate HMAC SHA256 signature for Bitget API
   * Signature format: Base64(HMAC_SHA256(secretKey, preHash))
   * preHash format: timestamp + method.toUpperCase() + requestPath + queryString + body
   */
  private generateSignature(timestamp: string, method: string, requestPath: string, queryString: string, body: string): string {
    // Build pre-hash string
    let preHash = timestamp + method.toUpperCase() + requestPath;
    
    // Add query string if present (with ? prefix)
    if (queryString) {
      preHash += '?' + queryString;
    }
    
    // Add body if present
    if (body) {
      preHash += body;
    }

    // Generate HMAC SHA256 and Base64 encode
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(preHash)
      .digest('base64');

    return signature;
  }

  /**
   * Make authenticated request to Bitget API
   */
  private async makeAuthenticatedRequest(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {},
    body: Record<string, any> | null = null
  ) {
    // Sync time with Bitget server if needed
    const now = Date.now();
    if (!this.lastTimeSync || (now - this.lastTimeSync) > 60000 || Math.abs(this.timeOffset) > 1000) {
      await this.syncServerTime();
    }

    const timestamp = String(Date.now() + this.timeOffset);
    
    // Build query string for GET requests
    let queryString = '';
    if (method === 'GET' && Object.keys(params).length > 0) {
      queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    }

    // Build body string for POST requests
    const bodyString = body ? JSON.stringify(body) : '';

    // Generate signature
    const signature = this.generateSignature(timestamp, method, endpoint, queryString, bodyString);

    // Build URL
    let url = `${BITGET_BASE_URL}${endpoint}`;
    if (queryString) {
      url += '?' + queryString;
    }

    try {
      const response = await axios({
        method,
        url,
        data: body || undefined,
        headers: {
          'ACCESS-KEY': this.apiKey,
          'ACCESS-SIGN': signature,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-PASSPHRASE': this.passphrase,
          'Content-Type': 'application/json',
          'locale': 'en-US',
        },
        timeout: 30000,
      });

      // Check Bitget response code
      if (response.data.code !== '00000') {
        const error = new Error(response.data.msg || 'Bitget API error') as any;
        error.code = response.data.code;
        error.bitgetError = response.data;
        throw error;
      }

      return response.data;
    } catch (error: any) {
      const bitgetError = error.response?.data || error.bitgetError;
      console.error('Bitget API Error:', bitgetError || error.message);

      const errorMessage = bitgetError?.msg || error.message || 'Unknown Bitget API error';
      const errorCode = bitgetError?.code;

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.code = errorCode;
      enhancedError.bitgetError = bitgetError;

      throw enhancedError;
    }
  }

  /**
   * Check server's public IP address
   */
  async getServerPublicIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
      const ip = response.data.ip;
      console.log(`Server's public IP address: ${ip}`);
      return ip;
    } catch (error) {
      console.error('Failed to get public IP:', error);
      throw new Error('Unable to determine server public IP');
    }
  }

  /**
   * Get account balances
   * V2 Endpoint: GET /api/v2/spot/account/assets
   */
  async getAccountBalances(): Promise<BitgetBalanceResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/account/assets');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching Bitget balances:', error);
      throw error;
    }
  }

  /**
   * Get specific coin balance
   */
  async getCoinBalance(coin: string): Promise<BitgetBalanceResponse | null> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/account/assets', { coin: coin.toUpperCase() });
      const balances = response.data || [];
      return balances.find((b: BitgetBalanceResponse) => b.coinName?.toUpperCase() === coin.toUpperCase() || b.coin?.toUpperCase() === coin.toUpperCase()) || null;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      throw error;
    }
  }

  /**
   * Get all coins info with networks
   * V2 Endpoint: GET /api/v2/spot/public/coins
   */
  async getAllCoinsInfo(): Promise<BitgetCoinInfo[]> {
    try {
      const response = await axios.get(`${BITGET_BASE_URL}/api/v2/spot/public/coins`);
      if (response.data.code === '00000') {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching coins info:', error);
      throw error;
    }
  }

  /**
   * Get available networks for a coin
   */
  async getCoinNetworks(coin: string): Promise<BitgetCoinNetwork[]> {
    try {
      const coinsInfo = await this.getAllCoinsInfo();
      const coinInfo = coinsInfo.find((c: BitgetCoinInfo) => 
        c.coinName?.toUpperCase() === coin.toUpperCase() || 
        c.coinDisplayName?.toUpperCase() === coin.toUpperCase()
      );
      return coinInfo?.chains || [];
    } catch (error: any) {
      console.error('Error fetching coin networks:', error);
      throw error;
    }
  }

  /**
   * NOTE: Bitget does NOT provide a public API for address book management.
   * Addresses must be added manually via Bitget web interface:
   * 1. Log in to Bitget
   * 2. Go to Assets -> Withdraw
   * 3. Select the coin and network
   * 4. Click "Address Book" or "Add Address"
   * 5. Add the withdrawal address and complete verification
   * 
   * The methods below are kept as stubs for potential future API support.
   */

  /**
   * Get address book entries (NOT AVAILABLE IN BITGET API)
   * Returns empty array as Bitget doesn't expose this endpoint
   */
  async getAddressBook(_coin?: string, _chain?: string): Promise<BitgetAddressBookEntry[]> {
    console.log('Note: Bitget API does not support address book retrieval');
    return [];
  }

  /**
   * Check if an address exists in the address book
   * Since API is not available, always returns false (unknown)
   */
  async isAddressInAddressBook(_coin: string, _address: string, _chain: string): Promise<boolean> {
    // Cannot check via API - address book must be managed via Bitget web UI
    return false;
  }

  /**
   * Add address to address book (NOT AVAILABLE IN BITGET API)
   * Bitget requires manual address whitelisting via web interface
   */
  async addToAddressBook(_params: BitgetAddAddressParams): Promise<{ id: string; success: boolean }> {
    console.log('Note: Bitget API does not support adding addresses to address book');
    console.log('Please add addresses manually via Bitget web interface');
    // Return success=false but don't throw - let withdrawal attempt proceed
    return { id: '', success: false };
  }

  /**
   * Withdraw cryptocurrency to external address
   * V2 Endpoint: POST /api/v2/spot/wallet/withdrawal
   * 
   * IMPORTANT: Address must be pre-added to Bitget address book (whitelist) manually!
   * Go to Bitget -> Assets -> Withdraw -> Address Book to add addresses.
   */
  async withdraw(params: BitgetWithdrawParams): Promise<BitgetWithdrawResponse> {
    const { coin, chain, address, amount, clientOid, tag, remark } = params;

    // Log current server IP for debugging IP whitelist issues
    try {
      const currentIP = await this.getServerPublicIP();
      console.log(`Current server IP for Bitget withdrawal: ${currentIP}`);
    } catch (ipErr) {
      console.log('Could not determine server IP for logging');
    }

    // Check balance before attempting withdrawal
    try {
      const balance = await this.getCoinBalance(coin);
      const availableBalance = parseFloat(balance?.available || '0');
      const withdrawFee = await this.getWithdrawFee(coin, chain);
      const totalRequired = amount + withdrawFee;

      console.log(`Bitget balance check: Available=${availableBalance} ${coin}, Required=${amount} + fee=${withdrawFee} = ${totalRequired}`);

      if (availableBalance < totalRequired) {
        throw {
          success: false,
          code: '43012',
          message: `Insufficient Bitget balance. Available: ${availableBalance} ${coin}, Required: ${totalRequired} ${coin} (${amount} + ${withdrawFee} fee). Please deposit more ${coin} to your Bitget Spot wallet.`,
          availableBalance,
          requiredAmount: totalRequired,
          withdrawFee,
        };
      }
      // Check minimum withdrawal amount for the coin/network
      try {
        const minWithdraw = await this.getMinWithdraw(coin, chain);
        console.log(`Bitget min withdrawal check: ${coin}/${chain} requires minimum ${minWithdraw} ${coin}, requested ${amount} ${coin}`);
        if (minWithdraw && amount < minWithdraw) {
          const error: any = new Error(`Withdrawal amount (${amount} ${coin}) is below Bitget minimum withdrawal amount (${minWithdraw} ${coin}) for network ${chain.toUpperCase()}.`);
          error.success = false;
          error.code = '43114';
          error.minWithdraw = minWithdraw;
          error.message = `Withdrawal amount (${amount} ${coin}) is below Bitget minimum withdrawal amount (${minWithdraw} ${coin}) for network ${chain.toUpperCase()}. Please increase the withdrawal amount to at least ${minWithdraw} ${coin}.`;
          throw error;
        }
      } catch (minErr: any) {
        // Re-throw if it's our min withdrawal error
        if (minErr.code === '43114') {
          throw minErr;
        }
        // If getMinWithdraw fails, log and continue — we'll let Bitget API return the canonical error
        console.warn('Could not verify min withdrawal amount:', minErr?.message || minErr);
      }
    } catch (balanceError: any) {
      if (balanceError.code === '43012') {
        throw balanceError; // Re-throw our custom insufficient balance error
      }
      console.warn('Could not verify balance before withdrawal:', balanceError.message);
      // Continue with withdrawal attempt even if balance check fails
    }

    // Round amount based on coin type (USDT/stablecoins = 6 decimals, others = 8)
    const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD'];
    const decimals = stablecoins.includes(coin.toUpperCase()) ? 6 : 8;
    const multiplier = Math.pow(10, decimals);
    const roundedAmount = Math.floor(amount * multiplier) / multiplier;

    const requestBody: Record<string, any> = {
      coin: coin.toUpperCase(),
      address,
      chain: chain.toLowerCase(), // Bitget uses lowercase for chain (e.g., 'trc20', 'erc20')
      size: roundedAmount.toString(), // V2 uses 'size' instead of 'amount'
      transferType: 'on_chain', // on_chain for external withdrawal
    };

    // Add optional parameters
    if (clientOid) {
      requestBody.clientOid = clientOid;
    }

    // Add address tag for networks like XRP, XLM
    if (tag) {
      requestBody.tag = tag;
    }

    // Add remark/description
    if (remark) {
      requestBody.remark = remark;
    }

    try {
      console.log('Bitget withdrawal request:', {
        coin,
        chain,
        address: `${address.substring(0, 10)}...`,
        amount: roundedAmount,
      });

      const response = await this.makeAuthenticatedRequest(
        'POST',
        '/api/v2/spot/wallet/withdrawal',
        {},
        requestBody
      );

      console.log('Bitget withdrawal response:', response);

      return {
        orderId: response.data.orderId,
        clientOrderId: response.data.clientOid,
        success: true,
      };
    } catch (error: any) {
      console.error('Bitget withdrawal error:', error.bitgetError || error.message);

      const errorMsg = error.bitgetError?.msg || error.message || 'Unknown error';
      const errorCode = error.bitgetError?.code || error.code;

      // Provide specific guidance based on error code
      let userFriendlyMessage = errorMsg;
      
      // Address book error
      if (errorCode === '40938' || errorMsg.toLowerCase().includes('addressbook') || errorMsg.toLowerCase().includes('address book')) {
        userFriendlyMessage = `Withdrawal address is not whitelisted in Bitget. Please add this address manually:\n` +
          `1. Log in to Bitget (https://www.bitget.com)\n` +
          `2. Go to Assets -> Withdraw\n` +
          `3. Select ${coin} and ${chain.toUpperCase()} network\n` +
          `4. Click "Address Book" and add: ${address}\n` +
          `5. Complete the security verification\n` +
          `6. Try the withdrawal again after adding the address.`;
      }
      
      // Insufficient balance error
      if (errorCode === '43012' || errorMsg.toLowerCase().includes('insufficient balance')) {
        userFriendlyMessage = `Insufficient ${coin} balance in Bitget Spot wallet to process this withdrawal (${amount} ${coin} + network fee). ` +
          `Please deposit more ${coin} to your Bitget Spot account or transfer from other wallets (Futures/Earn) to Spot.`;
      }
      
      // Minimum withdrawal amount error
      if (errorCode === '43114' || errorMsg.toLowerCase().includes('min withdraw') || errorMsg.toLowerCase().includes('minimum')) {
        userFriendlyMessage = `Withdrawal amount (${roundedAmount} ${coin}) is below Bitget's minimum withdrawal amount for ${chain.toUpperCase()} network. ` +
          `Minimum withdrawal for USDT is 10 USDT on all networks (TRC20, BEP20, ERC20, etc.). ` +
          `Please increase the withdrawal amount to at least 10 USDT.`;
      }

      throw {
        success: false,
        code: errorCode,
        message: userFriendlyMessage,
        originalError: error,
      };
    }
  }

  /**
   * Internal withdrawal (between Bitget users)
   * V2 Endpoint: POST /api/v2/spot/wallet/withdrawal (with transferType: 'internal')
   */
  async withdrawInternal(coin: string, toUid: string, amount: number, clientOid?: string): Promise<BitgetWithdrawResponse> {
    const requestBody: Record<string, any> = {
      coin: coin.toUpperCase(),
      toUid,
      size: amount.toString(),
      transferType: 'internal',
    };

    if (clientOid) {
      requestBody.clientOid = clientOid;
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        'POST',
        '/api/v2/spot/wallet/withdrawal',
        {},
        requestBody
      );

      return {
        orderId: response.data.orderId,
        clientOrderId: response.data.clientOid,
        success: true,
      };
    } catch (error: any) {
      throw {
        success: false,
        code: error.code,
        message: error.message,
        originalError: error,
      };
    }
  }

  /**
   * Get withdrawal history
   * V2 Endpoint: GET /api/v2/spot/wallet/withdrawal-records
   */
  async getWithdrawHistory(coin?: string, startTime?: number, endTime?: number, clientOid?: string): Promise<any[]> {
    const params: Record<string, any> = {};

    if (coin) params.coin = coin.toUpperCase();
    if (startTime) params.startTime = startTime.toString();
    if (endTime) params.endTime = endTime.toString();
    if (clientOid) params.clientOid = clientOid;

    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/wallet/withdrawal-records', params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }

  /**
   * Get deposit history
   * V2 Endpoint: GET /api/v2/spot/wallet/deposit-records
   */
  async getDepositHistory(coin?: string, startTime?: number, endTime?: number): Promise<any[]> {
    const params: Record<string, any> = {};

    if (coin) params.coin = coin.toUpperCase();
    if (startTime) params.startTime = startTime.toString();
    if (endTime) params.endTime = endTime.toString();

    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/wallet/deposit-records', params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching deposit history:', error);
      throw error;
    }
  }

  /**
   * Get deposit address
   * V2 Endpoint: GET /api/v2/spot/wallet/deposit-address
   */
  async getDepositAddress(coin: string, chain: string): Promise<{ address: string; chain: string; coin: string; tag: string; url: string }> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/wallet/deposit-address', {
        coin: coin.toUpperCase(),
        chain: chain.toLowerCase(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposit address:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal status by ID
   */
  async getWithdrawStatus(withdrawId: string): Promise<any> {
    try {
      const history = await this.getWithdrawHistory();
      return history.find((w: any) => w.id === withdrawId || w.txId === withdrawId);
    } catch (error) {
      console.error('Error fetching withdrawal status:', error);
      throw error;
    }
  }

  /**
   * Check if withdrawal is enabled for a coin/network
   */
  async isWithdrawEnabled(coin: string, chain: string): Promise<boolean> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: BitgetCoinNetwork) => 
        n.chain?.toLowerCase() === chain.toLowerCase()
      );
      return networkInfo?.withdrawable === 'true';
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      return false;
    }
  }

  /**
   * Get minimum withdrawal amount for coin/network
   */
  async getMinWithdraw(coin: string, chain: string): Promise<number> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: BitgetCoinNetwork) => 
        n.chain?.toLowerCase() === chain.toLowerCase()
      );
      return parseFloat(networkInfo?.minWithdrawAmount || '0');
    } catch (error) {
      console.error('Error getting min withdrawal:', error);
      return 0;
    }
  }

  /**
   * Get withdrawal fee for coin/network
   */
  async getWithdrawFee(coin: string, chain: string): Promise<number> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: BitgetCoinNetwork) => 
        n.chain?.toLowerCase() === chain.toLowerCase()
      );
      return parseFloat(networkInfo?.withdrawFee || '0');
    } catch (error) {
      console.error('Error getting withdrawal fee:', error);
      return 0;
    }
  }

  /**
   * Transfer between accounts (Spot <-> Futures)
   * V2 Endpoint: POST /api/v2/spot/wallet/transfer
   */
  async transfer(
    fromType: 'spot' | 'mix_usdt' | 'mix_usd' | 'mix_usdc' | 'p2p' | 'coin_futures' | 'usdt_futures' | 'usdc_futures',
    toType: 'spot' | 'mix_usdt' | 'mix_usd' | 'mix_usdc' | 'p2p' | 'coin_futures' | 'usdt_futures' | 'usdc_futures',
    coin: string,
    amount: number,
    clientOid?: string
  ): Promise<{ transferId: string; clientOrderId?: string }> {
    const requestBody: Record<string, any> = {
      fromType,
      toType,
      coin: coin.toUpperCase(),
      size: amount.toString(),
    };

    if (clientOid) {
      requestBody.clientOid = clientOid;
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        'POST',
        '/api/v2/spot/wallet/transfer',
        {},
        requestBody
      );

      return {
        transferId: response.data.transferId,
        clientOrderId: response.data.clientOid,
      };
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }

  /**
   * Get API key info
   * V2 Endpoint: GET /api/v2/spot/account/info
   */
  async getApiKeyInfo(): Promise<any> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/api/v2/spot/account/info');
      return response.data;
    } catch (error) {
      console.error('Error fetching API key info:', error);
      throw error;
    }
  }

  /**
   * Validate wallet address format
   */
  validateAddress(address: string, chain: string): boolean {
    if (!address || address.length < 20) return false;

    const chainLower = chain.toLowerCase();

    // EVM compatible chains (BSC/BEP20, ETH/ERC20, Polygon/MATIC)
    if (['bep20', 'erc20', 'polygon', 'arbitrum', 'optimism', 'avaxc', 'bsc', 'eth'].includes(chainLower)) {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // TRON network
    if (['trc20', 'trx'].includes(chainLower)) {
      return /^T[a-zA-Z0-9]{33}$/.test(address);
    }

    // Solana
    if (['sol', 'solana'].includes(chainLower)) {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }

    // Bitcoin
    if (['btc', 'bitcoin'].includes(chainLower)) {
      // Legacy, SegWit, Native SegWit
      return /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
             /^bc1[a-zA-HJ-NP-Z0-9]{25,89}$/.test(address);
    }

    // Default validation
    return address.length >= 20;
  }

  /**
   * Get current USDT price in USD (approximate, USDT ≈ 1 USD)
   */
  async getUSDTPrice(): Promise<number> {
    try {
      const response = await axios.get(`${BITGET_BASE_URL}/api/v2/spot/market/tickers?symbol=USDCUSDT`);
      if (response.data.code === '00000' && response.data.data?.length > 0) {
        return parseFloat(response.data.data[0]?.lastPr) || 1;
      }
      return 1;
    } catch (error) {
      return 1;
    }
  }

  /**
   * Get ticker price for a trading pair
   * V2 Endpoint: GET /api/v2/spot/market/tickers
   */
  async getTickerPrice(symbol: string): Promise<number> {
    try {
      // V2 uses simple symbol format: BTCUSDT
      const bitgetSymbol = symbol.toUpperCase().replace('_SPBL', '');
      const response = await axios.get(`${BITGET_BASE_URL}/api/v2/spot/market/tickers?symbol=${bitgetSymbol}`);
      if (response.data.code === '00000' && response.data.data?.length > 0) {
        return parseFloat(response.data.data[0]?.lastPr) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching ticker price:', error);
      return 0;
    }
  }

  /**
   * Convert USD to crypto amount
   */
  convertUSDToCrypto(amountUSD: number, coin: string): number {
    const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD'];
    if (stablecoins.includes(coin.toUpperCase())) {
      return amountUSD;
    }
    return amountUSD;
  }

  /**
   * Map common network names to Bitget chain format
   */
  mapNetworkToBitgetChain(network: string): string {
    const networkMap: Record<string, string> = {
      'BSC': 'bep20',
      'BEP20': 'bep20',
      'ETH': 'erc20',
      'ERC20': 'erc20',
      'TRX': 'trc20',
      'TRC20': 'trc20',
      'TRON': 'trc20',
      'MATIC': 'polygon',
      'POLYGON': 'polygon',
      'SOL': 'sol',
      'SOLANA': 'sol',
      'ARB': 'arbitrum',
      'ARBITRUM': 'arbitrum',
      'OP': 'optimism',
      'OPTIMISM': 'optimism',
      'AVAX': 'avaxc',
      'AVALANCHE': 'avaxc',
      'BTC': 'btc',
      'BITCOIN': 'btc',
    };
    return networkMap[network.toUpperCase()] || network.toLowerCase();
  }
}

// Create singleton instance
const bitgetService = new BitgetService();

export { BitgetService };
export default bitgetService;
