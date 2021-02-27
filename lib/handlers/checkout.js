const _data = require('../data');
const api = require('../services/api');
const { safeWrapper } = require('../helpers');

const DEFAULT_CURRENCY = 'usd';

const checkout = (data, callback) => {
  const acceptableMethods = ['post'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _checkout[data.method](data, callback);
  } else {
    callback(405);
  }
};

_checkout = {};

_checkout.post = safeWrapper(async (data, callback) => {
  const email = data?.payload?.email;
  if (!email)
    return callback(400, {error: 'Ok, ok. But first let me know your email.'});

  const cart = await _data.read('carts',email);
  const amount = cart.reduce(((sum,cur) => sum + cur.price),0);
  console.log(cart,amount);
  const cardToken = data?.payload?.cardToken;

  await api.charge(amount, DEFAULT_CURRENCY, cardToken, async (err,res) => {
    if(!err) {

      console.log(res);

      await api.sendMail(
        email,
        'Purchase DONE',
        `Your payment of $${(amount/100).toFixed('2')} has been accepted. You know what you bought, right?`,
        async (err,res) => {
          if(!err){
            await _data.update('carts',email,[]);
            return callback(200,{
              message: `Your payment of $${(amount/100).toFixed('2')} has been accepted. Check your email for a receipt.`,
              paid: amount/100
            });
          }
          else 
            return callback(400,{...err, ...res});
        }
      );
    } else {
      return callback(400,err);
    }
  });
});

module.exports = checkout;