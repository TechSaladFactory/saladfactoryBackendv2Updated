const express = require("express");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const cloudinary_connection=require("./config/cloudinary")

const globalErorr = require("./middlewares/erorrMiddlewares");
const db_MongoDB = require("./config/database");
const DepartmentRoutes = require("./routes/departmentRoutes");
const productRoutes = require("./routes/productRoutes");
const productOPRoutes = require("./routes/productOPRoutes");
const userRoutes = require("./routes/userRoutes");
const ApiErrors = require("./utils/apiErrors");
const authRoutes = require("./routes/authRoutes");
const SupplierRoutes = require("./routes/supplierRoutes");
const UnitRoutes = require("./routes/unitRoutes");
const emaillerRoutes = require("./routes/emaillerRoute");
const TransactionRoutes = require("./routes/transactionRoutes");
const  MainProductRoutes = require("./routes/mainProductRoutes");
const  FatwraRoutes = require("./routes/fatwraRoutes");
const  BranchRoutes = require("./routes/branchRoutes");
const  OrderProductionRoutes = require("./routes/orderProductionRoutes");
const  orderSupplyRoutes = require("./routes/orderSupplyRoutes");
const  MainProductOPRoutes = require("./routes/mainProductOPRoutes");
const  ProductionRoutes = require("./routes/productionRoutes");

const cors = require("cors");
var compression = require("compression");

const basepathApi = "/api";
//Mode Connections
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}
//****************

//database connection
db_MongoDB();
cloudinary_connection();
//middleware
app.use(express.json());
//allow User to acces to ur Domain
app.use(cors());
app.options("*", cors());

//compression response
app.use(compression());

//Routes
app.use(`${basepathApi}/users`, userRoutes);
app.use(`${basepathApi}/auth`, authRoutes);

app.use(`${basepathApi}/department`, DepartmentRoutes);
app.use(`${basepathApi}/supplier`, SupplierRoutes);
app.use(`${basepathApi}/unit`, UnitRoutes);
app.use(`${basepathApi}/product`, productRoutes);
app.use(`${basepathApi}/productOP`, productOPRoutes);
app.use(`${basepathApi}/transaction`, TransactionRoutes);
app.use(`${basepathApi}/email`, emaillerRoutes);
app.use(`${basepathApi}/mainProduct`, MainProductRoutes);
app.use(`${basepathApi}/mainProductOP`, MainProductOPRoutes);
app.use(`${basepathApi}/fatwra`, FatwraRoutes);
app.use(`${basepathApi}/branch`, BranchRoutes);
app.use(`${basepathApi}/orderProduction`, OrderProductionRoutes);
app.use(`${basepathApi}/Production`,ProductionRoutes );
app.use(`${basepathApi}/orderSupply`,orderSupplyRoutes );



//errors
app.all("*", (req, res, next) => {
  next(new ApiErrors(`Can't found the url ${req.originalUrl}`, 400));
});

app.use(globalErorr);

const port = process.env.PORT;
const server = app.listen(port, function () {
  console.log(`Server is running ${port} ... `);
});

process.on("unhandledRejection", (erorr) => {
  console.error(`unhandledRejection Erorr : ${erorr.name} || ${erorr.message}`);
  server.close(() => {
    console.error(`Shutting Down Server .`);
    process.exit(1);
  });
});
