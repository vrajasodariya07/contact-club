import jwt from 'jsonwebtoken';
import config from './config.js';
// const nodemailer = require('nodemailer');

const getToken = (user) => {
    try {
        return jwt.sign(
            {
              _id: user._id,
              givenName: user.givenName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              isActive: user.isActive,
             
            },
            config.JWT_SECRET,
            {
              expiresIn: '422h',
            }
          );
    } catch (error) {
        console.log(error)
    }
  
};


const isAuth = (req, res, next) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization;
  
  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      req.user = decode;
      next();
      return;
    });
  } else {
    return res.status(401).send({ message: 'Token is not supplied.' });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user.isAdmin);
  if (req.user && req.user.isAdmin) {
    console.log("success for the admin");
    return next();
  }
  console.log("fail for the admin");
  return res.status(401).send({ message: "Admin Token is not valid..." });
}

const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token' });
  }
};
const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token' });
  }
};

export {
  getToken, isAdmin, isAuth ,isSeller , isSellerOrAdmin
}

// export const mailgun = () =>
//   mg({
//     apiKey: process.env.MAILGUN_API_KEY,
//     domain: process.env.MAILGUN_DOMIAN,
//   });

//   export const transport = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: "587",
//     auth: {
//       user: "easton.gerhold95@ethereal.email",
//       pass: 'TwyFH5z78E41QUqbjf'
//     },
//   });

// export const payOrderEmailTemplate = (order) => {
//   console.log(order);
//   return `<h1>Thanks for shopping with us</h1>
//   <p>
//   Hi ${order.user.name},</p>
//   <p>We have finished processing your order.</p>
//   <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
//   <table>
//   <thead>
//   <tr>
//   <td><strong>Product</strong></td>
//   <td><strong>Quantity</strong></td>
//   <td><strong align="right">Price</strong></td>
//   </thead>
//   <tbody>
//   ${order.orderItems
//     .map(
//       (item) => `
//     <tr>
//     <td>${item.name}</td>
//     <td align="center">${item.qty}</td>
//     <td align="right"> $${item.price}</td>
//     </tr>
//   `
//     )
//     .join('\n')}
//   </tbody>
//   <tfoot>
//   <tr>
//   <td colspan="2">Items Price:</td>
//   <td align="right"> $${order.itemsPrice}</td>
//   </tr>
//   <tr>
//   <td colspan="2">Tax Price:</td>
//   <td align="right"> $${order.taxPrice}</td>
//   </tr>
//   <tr>
//   <td colspan="2">Shipping Price:</td>
//   <td align="right"> $${order.shippingPrice}</td>
//   </tr>
//   <tr>
//   <td colspan="2"><strong>Total Price:</strong></td>
//   <td align="right"><strong> $${order.totalPrice}</strong></td>
//   </tr>
//   <tr>
//   <td colspan="2">Payment Method:</td>
//   <td align="right">${order.paymentMethod}</td>
//   </tr>
//   </table>
//   <h2>Shipping address</h2>
//   <p>
 
//   ${order.shipping.address},<br/>
//   ${order.shipping.city},<br/>
//   ${order.shipping.country},<br/>
//   ${order.shipping.postalCode}<br/>
//   </p>
//   <hr/>
//   <p>
//   Thanks for shopping with us.
//   </p>
//   `;
// };