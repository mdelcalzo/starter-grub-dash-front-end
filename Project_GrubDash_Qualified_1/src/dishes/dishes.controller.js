const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// create() to post a new dish:
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body
    // dish object for making an update request.
    const newDish = {
        id: nextId(),
        name, 
        description,
        price, 
        image_url,
    }
    //push new dish onto array of all other dishes
    dishes.push(newDish)
    //send an okay status and the new dish object.
    res.status(201).json({ data: newDish })
}

function read(req, res) {
    
    const dishId = req.params.dishId
    const matchingDish = dishes.find((dish) => dish.id === dishId)

    res.json({ data: res.locals.matchingDish })
}

function update(req, res) {
    const dishId = req.params.dishId
    
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    const { data: { name, description, price, image_url } = {} } = req.body
    
    matchingDish.description = description
    matchingDish.name = name
    matchingDish.price = price
    matchingDish.image_url = image_url
  
    res.json({ data: matchingDish })
  }


function list(req, res) {
    res.json({
        data: dishes
    })
}

function bodyHasName(req, res, next) {
  
    const { data: { name } = {} } = req.body
   
    if (name) {
        res.locals.name = name
        return next()
    } else {
        
        next({
            status: 400,
            message: `A 'name' property is required.`,
        })
    }
}

function bodyHasDescription(req, res, next) {
  
    const { data: { description } = {} } = req.body
   
    if (description) {
        res.locals.description = description
        return next()
    } else {
        next({
            status: 400,
            message: `A 'description' property is required.`,
        })
    }
}

function bodyHasPrice(req, res, next) {
  
    const { data: { price } = {} } = req.body
   
    if (price) {
        res.locals.price = price
        return next()
    } else {
      
        next({
            status: 400,
            message: `A 'price' property is required.`,
        })
    }
}

function bodyHasValidPrice(req, res, next) {
    
    const { data: { price } = {} } = req.body
  
    if (price > -1) {
        res.locals.price = price
        return next()
    } else {
       
        next({
            status: 400,
            message: `price cannot be less than 0.`,
        })
    }
}

function bodyHasValidPriceForUpdate(req, res, next) {
    
    const { data: { price } = {} } = req.body
  
    if (res.locals.price <= 0 || typeof res.locals.price !== "number") {
        next({
            status: 400,
            message: `price must be an integer greater than $0.`,
        })
    } else {
      
        return next()
    }
}

function bodyHasImg(req, res, next) {
   
    const { data: { image_url } = {} } = req.body
   
    if (image_url) {
        res.locals.image_url = image_url
        return next()
    } else {
        
        next({
            status: 400,
            message: `An 'image_url' property is required.`
        })
    }
}

function dishExists(req, res, next) {
    const { dishId } = req.params
   
    const matchingDish = dishes.find((dish) => dish.id === dishId)
   
    if (matchingDish) {
      res.locals.matchingDish = matchingDish
     
      return next()
    }
   
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}


function dishIdMatchesDataId(req, res, next) {
    const { data: { id } = {} } = req.body
    const dishId = req.params.dishId
    // if the id is defined, not null, not a string, and not the dishId
    if (id !== "" && id !== dishId && id !== null && id !== undefined) {
      // return the following message
      next({
        status: 400,
        message: `id ${id} must match dataId provided in parameters`,
      })
    }
    // otherwise, move onto the next function
    return next()
}



function dishExists(req, res, next) {
    const { dishId } = req.params
  
    const matchingDish = dishes.find((dish) => dish.id === dishId)
 
    if (matchingDish) {
      res.locals.matchingDish = matchingDish
 
      return next()
    }
  
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        bodyHasValidPrice,
        bodyHasImg,
        create,
    ],
    update: [
       
      dishExists,
        dishIdMatchesDataId, 
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        bodyHasImg,
        bodyHasValidPriceForUpdate,
        update,
    ],
}