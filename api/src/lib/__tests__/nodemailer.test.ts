import { describe, expect, it } from '@jest/globals';

import lib from '../index';

describe('Mailing System ', () => {
  it('mail system online ', async () => {
    const mailToSend = {
      reciever: 'swayam@flipr.ai',
      subject: 'Testing Mail Config',
      html: '<h1>Mailing System Is Working Well</h1>',
    };
    const mailResponse = await lib.mailConfig.sendHTMLMail(mailToSend);
    expect(mailResponse.messageId).toBeDefined();
  }, 50000);
});
