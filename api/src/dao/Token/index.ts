import createForgetTokenDao from './createForgetToken.dao';
import createTokenDao from './createToken.dao';
import deleteForgetTokenDao from './deleteForgetToken.dao';
import deleteTokenDao from './deleteToken.dao';
import getForgetTokenDao from './getForgetToken.dao';
import getTokenDao from './getToken.dao';

export default {
  createToken: createTokenDao,
  deleteToken: deleteTokenDao,
  getToken: getTokenDao,
  createForgetToken: createForgetTokenDao,
  getForgetToken: getForgetTokenDao,
  deleteForgetToken: deleteForgetTokenDao,
};
