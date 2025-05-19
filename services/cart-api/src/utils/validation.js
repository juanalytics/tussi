const Joi = require('joi');

/**
 * Validación para elementos del carrito
 */
exports.validateCartItem = (data) => {
  const schema = Joi.object({
    productId: Joi.string().required().messages({
      'string.empty': 'El ID del producto no puede estar vacío',
      'any.required': 'El ID del producto es obligatorio'
    }),
    name: Joi.string().required().messages({
      'string.empty': 'El nombre del producto no puede estar vacío',
      'any.required': 'El nombre del producto es obligatorio'
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'El precio debe ser un número',
      'number.min': 'El precio no puede ser negativo',
      'any.required': 'El precio es obligatorio'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      'number.base': 'La cantidad debe ser un número',
      'number.integer': 'La cantidad debe ser un número entero',
      'number.min': 'La cantidad mínima es 1',
      'any.required': 'La cantidad es obligatoria'
    }),
    imageUrl: Joi.string().allow('', null)
  });

  return schema.validate(data);
};

/**
 * Validación para actualización de cantidad
 */
exports.validateQuantityUpdate = (data) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
      'number.base': 'La cantidad debe ser un número',
      'number.integer': 'La cantidad debe ser un número entero',
      'number.min': 'La cantidad mínima es 1',
      'any.required': 'La cantidad es obligatoria'
    })
  });

  return schema.validate(data);
};