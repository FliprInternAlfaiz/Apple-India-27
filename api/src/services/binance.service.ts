// services/binance.service.ts
import crypto from 'crypto';
import axios from 'axios';

// Binance API configuration
const BINANCE_BASE_URL = 'https://api.binance.com';

interface BinanceWithdrawParams {
  coin: string;
  network: string;
  address: string;
  amount: number;
  withdrawOrderId?: string;
}

interface BinanceWithdrawResponse {
  id: string;
  success: boolean;
  msg?: string;
}

interface BinanceBalanceResponse {
  coin: string;
  free: string;
  locked: string;
  freeze: string;
  withdrawing: string;
}

class BinanceService {
  private apiKey: string;
  private secretKey: string;
  private timeOffset: number = 0; // Offset between local time and Binance server time

  constructor(apiKey?: string, secretKey?: string) {
    this.apiKey = apiKey || process.env.BINANCE_API_KEY || '';
    this.secretKey = secretKey || process.env.BINANCE_SECRET_KEY || '';
  }

  /**
   * Update API credentials dynamically
   */
  setCredentials(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  /**
   * Get Binance server time and calculate offset
   */
  private async syncServerTime(): Promise<number> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/api/v3/time`);
      const serverTime = response.data.serverTime;
      const localTime = Date.now();
      this.timeOffset = serverTime - localTime;
      console.log(`Binance time sync: offset = ${this.timeOffset}ms`);
      return serverTime;
    } catch (error) {
      console.error('Failed to sync Binance server time:', error);
      return Date.now();
    }
  }

  /**
   * Generate HMAC SHA256 signature for Binance API
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Make authenticated request to Binance API
   */
  private async makeAuthenticatedRequest(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {}
  ) {
    // Sync time with Binance server to avoid timestamp errors
    await this.syncServerTime();
    
    const timestamp = Date.now() + this.timeOffset;
    const recvWindow = 60000; // 60 seconds window
    const queryParams = { ...params, timestamp, recvWindow };
    
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const signature = this.generateSignature(queryString);
    const signedQueryString = `${queryString}&signature=${signature}`;

    const url = `${BINANCE_BASE_URL}${endpoint}?${signedQueryString}`;

    try {
      const response = await axios({
        method,
        url,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      return response.data;
    } catch (error: any) {
      const binanceError = error.response?.data;
      console.error('Binance API Error:', binanceError || error.message);
      
      // Create a more informative error
      const errorMessage = binanceError?.msg || error.message || 'Unknown Binance API error';
      const errorCode = binanceError?.code;
      
      const enhancedError = new Error(errorMessage) as any;
      enhancedError.code = errorCode;
      enhancedError.binanceError = binanceError;
      
      throw enhancedError;
    }
  }

  /**
   * Get account balances
   */
  async getAccountBalances(): Promise<BinanceBalanceResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/sapi/v1/capital/config/getall');
      return response;
    } catch (error) {
      console.error('Error fetching Binance balances:', error);
      throw error;
    }
  }

  /**
   * Get specific coin balance
   */
  async getCoinBalance(coin: string): Promise<BinanceBalanceResponse | null> {
    try {
      const balances = await this.getAccountBalances();
      return balances.find((b: BinanceBalanceResponse) => b.coin.toUpperCase() === coin.toUpperCase()) || null;
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      throw error;
    }
  }

  /**
   * Get available networks for a coin
   */
  async getCoinNetworks(coin: string): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest('GET', '/sapi/v1/capital/config/getall');
      const coinInfo = response.find((c: any) => c.coin.toUpperCase() === coin.toUpperCase());
      return coinInfo?.networkList || [];
    } catch (error) {
      console.error('Error fetching coin networks:', error);
      throw error;
    }
  }

  /**
   * Withdraw cryptocurrency to external address
   */
  async withdraw(params: BinanceWithdrawParams): Promise<BinanceWithdrawResponse> {
    const { coin, network, address, amount, withdrawOrderId } = params;

    const requestParams: Record<string, any> = {
      coin: coin.toUpperCase(),
      network: network.toUpperCase(),
      address,
      amount: amount.toString(),
      walletType: 0,
      name: 'Withdrawal',
    };

    if (withdrawOrderId) {
      requestParams.withdrawOrderId = withdrawOrderId;
    }

    try {
      console.log('Binance withdrawal request:', {
        coin,
        network,
        address: `${address.substring(0, 10)}...`,
        amount,
      });

      const response = await this.makeAuthenticatedRequest('POST', '/sapi/v1/capital/withdraw/apply', requestParams);
      
      console.log('Binance withdrawal response:', response);

      return {
        id: response.id,
        success: true,
      };
    } catch (error: any) {
      console.error('Binance withdrawal error:', error.response?.data || error.message);
      
      const errorMsg = error.response?.data?.msg || error.message || 'Unknown error';
      const errorCode = error.response?.data?.code;

      throw {
        success: false,
        code: errorCode,
        message: errorMsg,
        originalError: error,
      };
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawHistory(coin?: string, startTime?: number, endTime?: number): Promise<any[]> {
    const params: Record<string, any> = {};
    
    if (coin) params.coin = coin.toUpperCase();
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    try {
      const response = await this.makeAuthenticatedRequest('GET', '/sapi/v1/capital/withdraw/history', params);
      return response;
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal status by ID
   */
  async getWithdrawStatus(withdrawId: string): Promise<any> {
    try {
      const history = await this.getWithdrawHistory();
      return history.find((w: any) => w.id === withdrawId);
    } catch (error) {
      console.error('Error fetching withdrawal status:', error);
      throw error;
    }
  }

  /**
   * Check if withdrawal is enabled for a coin/network
   */
  async isWithdrawEnabled(coin: string, network: string): Promise<boolean> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: any) => n.network.toUpperCase() === network.toUpperCase());
      return networkInfo?.withdrawEnable || false;
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      return false;
    }
  }

  /**
   * Get minimum withdrawal amount for coin/network
   */
  async getMinWithdraw(coin: string, network: string): Promise<number> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: any) => n.network.toUpperCase() === network.toUpperCase());
      return parseFloat(networkInfo?.withdrawMin || '0');
    } catch (error) {
      console.error('Error getting min withdrawal:', error);
      return 0;
    }
  }

  /**
   * Get withdrawal fee for coin/network
   */
  async getWithdrawFee(coin: string, network: string): Promise<number> {
    try {
      const networks = await this.getCoinNetworks(coin);
      const networkInfo = networks.find((n: any) => n.network.toUpperCase() === network.toUpperCase());
      return parseFloat(networkInfo?.withdrawFee || '0');
    } catch (error) {
      console.error('Error getting withdrawal fee:', error);
      return 0;
    }
  }

  /**
   * Validate wallet address format
   */
  validateAddress(address: string, network: string): boolean {
    if (!address || address.length < 20) return false;

    switch (network.toUpperCase()) {
      case 'BSC':
      case 'ETH':
      case 'MATIC':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'TRX':
        return /^T[a-zA-Z0-9]{33}$/.test(address);
      case 'SOL':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      default:
        return address.length >= 20;
    }
  }

  /**
   * Get current USDT price in USD
   */
  async getUSDTPrice(): Promise<number> {
    try {
      const response = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price?symbol=USDTUSDC`);
      return parseFloat(response.data.price) || 1;
    } catch (error) {
      return 1;
    }
  }

  /**
   * Convert USD to crypto amount
   */
  convertUSDToCrypto(amountUSD: number, coin: string): number {
    const stablecoins = ['USDT', 'USDC', 'BUSD'];
    if (stablecoins.includes(coin.toUpperCase())) {
      return amountUSD;
    }
    return amountUSD;
  }
}

const binanceService = new BinanceService();

export { BinanceService };
export default binanceService;
