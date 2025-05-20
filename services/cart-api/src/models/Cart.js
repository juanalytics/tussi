const mongoose = require('mongoose');

// Schema para los items del carrito
const CartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'El ID del producto es obligatorio']
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad mínima es 1']
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  _id: false // No necesitamos un ID especial para cada item
});

// Schema principal del carrito
const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'El ID de usuario es obligatorio'],
    index: true
  },
  items: [CartItemSchema],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Método virtual para calcular el total del carrito
CartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0).toFixed(2);
});

// Método virtual para contar los items
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
});

// Aseguramos que los virtuals se incluyan al convertir a JSON/Object
CartSchema.set('toJSON', { virtuals: true });
CartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', CartSchema);