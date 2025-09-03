import mongoose, { ConnectOptions, WriteConcern } from "mongoose";
import { db } from "../config";
import colorsUtils from "../helpers/colorsUtils";
import seedRoles from "../seeds/seedRoles";

// DB connection URI
const dbURI = `${db.url}/${db.name}`;

// Correctly typed writeConcern
const writeConcern: WriteConcern = { w: "majority" };

// Additional configuration options
const options: ConnectOptions = {
  minPoolSize: db.minPoolSize,
  maxPoolSize: db.maxPoolSize,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 45000,
  writeConcern,
};

mongoose.set("strictQuery", true);

function setRunValidators(this: any): void {
  this.setOptions({ runValidators: true });
}

// Plugin to ensure validators run on updates
mongoose.plugin((schema: any) => {
  schema.pre("findOneAndUpdate", setRunValidators);
  schema.pre("updateMany", setRunValidators);
  schema.pre("updateOne", setRunValidators);
  schema.pre("update", setRunValidators);
});

// Connect to MongoDB
mongoose
  .connect(dbURI, options)
  .then(() => colorsUtils.log("success", "🛢  Mongoose connection done"))
  .catch((e) => console.error("Mongoose connection error: " + e.message));

// Connection events
mongoose.connection.on("connected", () => {
  colorsUtils.log(
    "success",
    "🔗 Mongoose connection opened : " + mongoose.connection.host
  );
});

mongoose.connection.on("disconnected", () => {
  colorsUtils.log("warning", "Mongoose connection disconnected");
});

// Seed roles once DB is opened
mongoose.connection.once("open", async () => {
  await seedRoles();
});

export const connection = mongoose.connection;
