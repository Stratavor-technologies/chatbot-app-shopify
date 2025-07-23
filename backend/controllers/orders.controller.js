const express = require("express");
const Router = express.Router();
const Order = require('../models/orders');

Router.post("/orders/add/details", async (req, res) => {
    try {
        const data = req.body.edges;
        for (const edge of data) {
            const order_id = edge.node.id;
            const name = edge.node.name;
            let tracking_no = edge.node.fulfillments;
            var findorderData = await Order.findOne({"order_id": order_id});
            if(findorderData){
                await updateOrderDetails(order_id, tracking_no, name);
            }else{
                await saveOrderDetails(order_id, tracking_no, name);
            }            
        }

        return res.status(200).send({
            success: true,
            message: `Orders Add Successfully!`
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

async function saveOrderDetails(order_id, tracking_no, name) {
    try {
        const order = new Order({ order_id, tracking_no, name });
        await order.save();
    } catch (error) {
        console.error("Error saving order details:", error);
        throw error; // Propagate the error
    }
}


async function updateOrderDetails(order_id, tracking_no, name){
    try{
        await Order.findOneAndUpdate({order_id: order_id, name}, {
            "tracking_no": tracking_no,
        });
    } catch (error){
        console.error("Error update order details:", error);
        throw error; // Propagate the error
    }
}



Router.post("/orders/get/trackingNo", async (req, res) => {
    try {
        
        var orderId = req.body.customer_orderid;

        var findOrderId =  await Order.findOne({name: orderId})
        if(!findOrderId){
            return res.status(200).send({
                success: false,
                message: `Order Id Not found!`
            });
        }

        const fulfillments = findOrderId.tracking_no;

        var trackingNo = [];

        for (const data of fulfillments) {
            var trackingInfo = data.trackingInfo;
            for (const item of trackingInfo) {
                trackingNo.push(item.number) 
            }
        }
        
        var joinTrackingNO = trackingNo.map((num, index) => (index + 1) + ": " + num).join(',');
        
        return res.status(200).send({
            success: true,
            message: `Your Tracking Numbers: ${joinTrackingNO}` 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = Router;