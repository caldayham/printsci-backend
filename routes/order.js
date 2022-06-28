const router = require("express").Router();
const Order = require("../models/Order");
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require("./verifyToken");

//CREATE
router.post("/", verifyToken, async (req, res) => {

    const newOrder = new Order(req.body)
    
    try {

        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);

    } catch (err) {

        res.status(500).json(err);

    }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedOrder);

    } catch (err) {
        
        res.status(500).json(err);

    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuth, async (req, res) => {
    try {
       
       await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order was successfully deleted");
        
    } catch (err) {
        
        res.status(500).json(err);
        
   } 
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuth, async (req, res) => {
   try {
   
       const orders = await Order.find({userId: req.params.userId});
       res.status(200).json(orders);
   
   } catch (err) {

       res.status(500).json(err);
   
   } 
});

//GET ALL 
router.get("/", verifyTokenAndAdmin, async (req, res) => {

    const qNum = req.query.num
   
    try {
        
        const orders = await Order.find().limit(qNum? qNum : 1);
        res.status(200).json(orders);

    } catch (err) {

        res.status(500).json(err);

    }

});

//GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const prevMonth = new Date(new Date(date.setMonth(date.lastMonth - 1)));

    try {
        
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: prevMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).json(income);

    } catch (err) {

        res.status(500).json(err);

    }
});

module.exports = router;