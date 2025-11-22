import mongoose from 'mongoose';
import { cronInit } from '../crons';

class Config {
  async start() {
    try {
      await this.dbConnect(process.env.MONGO_URI ?? '');
      cronInit();
    } catch (error: any) {
      console.error('DB connection error : ', error);
      throw new Error('config error occured');
    }
  }

  private async dbConnect(url: string) {
    try {
      await mongoose.connect(url);
      console.log('Connected to DB');
    } catch (error: any) {
      console.error('DB Connection Error ', error);
      throw error;
    }
  }
}
export default Config;