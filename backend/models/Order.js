const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [{ name: String, qty: Number, price: Number }], default: [] },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
