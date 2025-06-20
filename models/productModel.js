const mongoose = require("mongoose")
const { ref } = require("pdfkit")

const ProductShema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name must't be empty"],
        unique: [true, "This Product is already exists"],
        trim: true,
        minlength: [1 , "Product name is too short"],
        maxlength: [32, "Product name is too long"],
    },
    bracode:{
        type: String,
        required: [true, "Product bracode must't be empty"],
        unique: [true, "This bracode is already exists"],
        trim: true,
        minlength: [3 , "Product bracode is too short"],
    },
    availableQuantity:{
        type:Number,
        required: [true, "Product availableQuantity must't be empty"],
        trim: true,
        default:0
    },
    minQuantity:{
        type:Number,
        trim: true,
        default:0
    },
    unit:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Unit",
        required:true
    },
    supplierAccepted:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Supplier",
        required:true
    },

    slug: {
        type: String,
        lowercase: true
    }
}, { timestamps: true })

 exports.productModel= mongoose.model("Product", ProductShema)

