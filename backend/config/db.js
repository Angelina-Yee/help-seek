import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const OPTS = {
  autoIndex: true,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
  family: 4,
  tls: true,
};

const mask = (uri = "") =>
  uri.replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@");

function deriveSeedHostsFromStd(std = "") {
  try {
    const afterAt = std.split("@")[1];
    const hostPortList = afterAt.split("/")[0];
    return hostPortList
      .split(",")
      .map(hp => hp.split(":")[0].trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function tryConnect(uri) {
  console.log("[db] trying", mask(uri));
  await mongoose.connect(uri, OPTS);
  console.log("DB connected");
}

async function probePrimary(host, { user, pass, db }) {
  const uri = `mongodb://${user}:${pass}@${host}:27017/${db}?tls=true&authSource=admin&retryWrites=true&directConnection=true`;
  const conn = await mongoose
    .createConnection(uri, { ...OPTS, serverSelectionTimeoutMS: 6000 })
    .asPromise();
  try {
    const hello = await conn.db.admin().command({ hello: 1 });
    const isPrimary = !!(hello.isWritablePrimary ?? hello.ismaster);
    await conn.close().catch(() => {});
    return isPrimary ? uri : null;
  } catch {
    await conn.close().catch(() => {});
    return null;
  }
}

export async function connectDB() {
  const {
    MONGO_URI_SRV,
    MONGO_URI_STD,
    MONGO_USER,
    MONGO_PASS,
    MONGO_DB = "test",
  } = process.env;

  if (MONGO_URI_SRV) {
    try { await tryConnect(MONGO_URI_SRV); return; }
    catch (e) { console.warn("DB SRV failed:", e.code || e.message); }
  }

  if (MONGO_URI_STD) {
    try { await tryConnect(MONGO_URI_STD); return; }
    catch (e) { console.warn("DB STD failed:", e.code || e.message); }
  }

  const hosts = deriveSeedHostsFromStd(MONGO_URI_STD);
  if (!hosts.length) {
    throw new Error("No hosts to probe (provide MONGO_URI_STD so hosts can be derived).");
  }
  if (!MONGO_USER || !MONGO_PASS) {
    throw new Error("MONGO_USER/MONGO_PASS missing for primary probe.");
  }

  for (const host of hosts) {
    const primaryUri = await probePrimary(host, {
      user: MONGO_USER,
      pass: MONGO_PASS,
      db: MONGO_DB,
    });
    if (primaryUri) {
      await tryConnect(primaryUri);
      console.log(`DB connected directly to primary (${host})`);
      return;
    }
  }

  throw new Error("No Mongo connection method succeeded.");
}