const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
/*In the src/orders/orders.controller.js
 file, add handlers and middleware functions to
create, read, update, delete, and list orders.*/

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
 const newOrder ={
   id:nextId(),
   deliverTo, 
   mobileNumber, 
   status, 
   dishes,
 }; 
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }


function read(req, res) {
    res.json({ data: res.locals.order });
  };



function update(req, res) {
   const order = res.locals.order;
   const { data: { deliverTo, mobileNumber, status, dishes} = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status
  order.dishes = dishes;
  
res.json({ data: order });
   }
 

function list(req, res) {
    res.json({ data: orders });
  }



function orderExists(req, res, next) { 
  const { orderId } = req.params; 
  const foundOrder = orders.find((order) =>order.id == orderId); 
if (foundOrder) { res.locals.order = foundOrder;  
 return next(); 
                }next({ status: 404, message: `Order id not found: ${orderId}` }); }


//whole object is missing, assign an empty object. missing properties or empty properties
  function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] && data[propertyName]!=="") {
        return next();
      }
      next({
          status: 400,
          message: `Order must include a ${propertyName}`
      });
    };
  }


  function dishDataEmpty(req, res, next) {
      const { data: {dishes}= {} } = req.body;
      if (dishes.length>0) {
        return next();
      }
      next({
          status: 400,
          message: "Order must include at least one dish"
      });
    };

function dishesIsArray(req, res, next) {
      const { data : {dishes} = {} } = req.body;
      if (!Array.isArray(dishes)) {
    
      next({status: 400, message: "Order must include at least one dish"});
    }
      return next()
      };
  
//pull out dishes as an array and loop thru to check

function hasQuantityZero(req, res, next) { 
  const { data: { dishes } = {} } = req.body; 
  let found = dishes.find((dish)=> Number(dish.quantity)== !0);
  if (found) {
 return next(); 
  }
 next({ status: 400, message: `Dish ${found} must have a quantity that is an integer greater than 0` })
  };



function hasQuantity(req, res, next) { 
  const { data: { dishes } = {} } = req.body; 
 dishes.forEach((dish, index)=> {
   if (!(Number(dish.quantity) > 0)) {
     
 next({ status: 400, message: `Dish ${dish.id} must have a quantity that is an integer greater than 0` })
   }
 })
  return next ()
  };


function hasQuantityInteger(req, res, next) { 
  const { data: { dishes } = {} } = req.body; 
 dishes.forEach((dish, index)=> {
 
 if ((typeof (dish.quantity)) !== "number"){

 next({ status: 400, message: `Dish ${dish.id} must have a quantity that is an integer greater than 0` })
   }
 })
  return next ()
  };


function hasValidId(req, res, next) { 
  const { orderId } = req.params; 
  const { data: { id } = {} } = req.body; 
  if (id) { 
    if (id === orderId) { 
      return next(); 
    } return next({ 
        status: 400, 
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`, 
      }); 
  } next(); 
}

function hasStatus(req, res, next) { 
const { data: { status } = {} } = req.body;

    if (status) {
      return next();
    }
    next({ status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
  };

function statusPropertyIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
};


//order cannot be deleted unless it is in status pending
function statusPending(req, res, next){
  const status = res.locals.order.status;
   if(status !== "pending"){
     next({ status:400, message: "An order cannot be deleted unless it is pending"})
   }
   return next()
 }

//find order and delete, 
function destroy(req, res, next){
  const order = res.locals.order;
  const index = orders.findIndex((ord) => ord.id ===Number(order.Id))
 
  orders.splice(index, 1);
  res.sendStatus(204)
  
} 

  module.exports = {
     create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"), 
        //hasDish,
        dishesIsArray,
        dishDataEmpty,
        hasQuantityZero,
        hasQuantityInteger,
        hasQuantity,
                  
        create],
    list,
    read: [orderExists, read],
    update: [orderExists, 
             bodyDataHas ("deliverTo"), 
             bodyDataHas ("mobileNumber"),
             bodyDataHas("dishes"),
             hasValidId,
             dishDataEmpty,
             dishesIsArray,
             // hasDish,
             hasQuantityZero,
            
             hasQuantityInteger,
             hasStatus,
             statusPropertyIsValid,
             hasQuantity,
                          
             update],
    destroy: [  orderExists, statusPending, destroy],
    orderExists,
    
  };