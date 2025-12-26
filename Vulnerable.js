/**
 * INTENTIONALLY VULNERABLE JAVASCRIPT FILE
 * Purpose: SAST testing only
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const child_process = require("child_process");
const jwt = require("jsonwebtoken");
const xml2js = require("xml2js");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   1. HARDCODED SECRETS
========================================================= */
const DB_PASSWORD = "SuperSecret123!";
const JWT_SECRET = "hardcoded_jwt_secret";

/* =========================================================
   2. INSECURE RANDOMNESS
========================================================= */
function generateToken() {
  return Math.random().toString(36).substring(2);
}

/* =========================================================
   3. WEAK CRYPTOGRAPHY (MD5)
========================================================= */
function weakHash(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

/* =========================================================
   4. CROSS-SITE SCRIPTING (XSS)
========================================================= */
app.get("/xss", (req, res) => {
  res.send("<h1>Hello " + req.query.name + "</h1>");
});

/* =========================================================
   5. SQL INJECTION (SIMULATED)
========================================================= */
app.get("/login", (req, res) => {
  const query =
    "SELECT * FROM users WHERE username = '" +
    req.query.user +
    "' AND password = '" +
    req.query.pass +
    "'";
  res.send("Executing query: " + query);
});

/* =========================================================
   6. COMMAND INJECTION
========================================================= */
app.get("/ping", (req, res) => {
  const cmd = "ping -c 1 " + req.query.host;
  child_process.exec(cmd, (err, output) => {
    res.send(output);
  });
});

/* =========================================================
   7. PATH TRAVERSAL
========================================================= */
app.get("/read", (req, res) => {
  const filePath = path.join(__dirname, req.query.file);
  res.send(fs.readFileSync(filePath, "utf8"));
});

/* =========================================================
   8. INSECURE DESERIALIZATION
========================================================= */
app.post("/deserialize", (req, res) => {
  try {
    const obj = JSON.parse(req.body.data); if (typeof obj !== 'object' || obj === null) throw new Error('Invalid payload');
    res.json(obj);
  } catch (e) { res.status(400).send('Invalid JSON'); }
});
  const obj = eval("(" + req.body.data + ")");
  res.json(obj);
});

/* =========================================================
   9. EVAL / CODE INJECTION
========================================================= */
app.get("/calc", (req, res) => {
  const result = eval(req.query.expr);
  res.send("Result: " + result);
});

/* =========================================================
   10. OPEN REDIRECT
========================================================= */
app.get("/redirect", (req, res) => {
  res.redirect(req.query.url);
});

/* =========================================================
   11. SERVER-SIDE REQUEST FORGERY (SSRF)
========================================================= */
app.get("/fetch", async (req, res) => {
  const response = await axios.get(req.query.url);
  res.send(response.data);
});

/* =========================================================
   12. XML EXTERNAL ENTITY (XXE)
========================================================= */
app.post("/xml", (req, res) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  parser.parseString(req.body.xml, (err, result) => {
    res.json(result);
  });
});

/* =========================================================
   13. REGEX DENIAL OF SERVICE (ReDoS)
========================================================= */
app.get("/redos", (req, res) => {
  const regex = /(a+)+$/;
  res.send(regex.test(req.query.input).toString());
});

/* =========================================================
   14. JWT "NONE" ALGORITHM ACCEPTANCE
========================================================= */
app.post("/jwt", (req, res) => {
  const decoded = jwt.verify(req.body.token, JWT_SECRET, {
    algorithms: ["none", "HS256"],
  });
  res.json(decoded);
});

/* =========================================================
   15. PROTOTYPE POLLUTION
========================================================= */
app.post("/merge", (req, res) => {
  const target = {};
  Object.assign(target, req.body);
  res.json(target);
});

/* =========================================================
   16. CORS MISCONFIGURATION
========================================================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* =========================================================
   17. MISSING CSRF PROTECTION
========================================================= */
app.post("/transfer", (req, res) => {
  res.send("Transferred amount: " + req.body.amount);
});

/* =========================================================
   18. INSECURE FILE UPLOAD
========================================================= */
app.post("/upload", (req, res) => {
  fs.writeFileSync(req.body.filename, req.body.content);
  res.send("File uploaded");
});

/* =========================================================
   SERVER
========================================================= */
app.listen(3000, () => {
  console.log("Vulnerable app running on port 3000");
});
