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
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const DB_PASSWORD = "SuperSecret123!";
const JWT_SECRET = "hardcoded_jwt_secret";

/* =========================================================
   2. INSECURE RANDOMNESS
========================================================= */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}
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
const host = req.query.host;
if (!/^[a-zA-Z0-9.-]+$/.test(host) || host.length > 253) return res.status(400).send('Invalid host');
const ping = child_process.spawn('ping', ['-c','1', host]);
let out = '';
ping.stdout.on('data', d => out += d); ping.stderr.on('data', d => out += d);
ping.on('close', () => res.send(out));
ping.on('error', () => res.status(500).send('Ping failed'));
  child_process.exec(cmd, (err, output) => {
    res.send(output);
  });
});

/* =========================================================
   7. PATH TRAVERSAL
========================================================= */
app.get("/read", (req, res) => {
app.get("/read", (req, res) => {
  const baseDir = path.join(__dirname, 'files');
  const requested = path.normalize(String(req.query.file || ''));
  if (requested.includes('..') || path.isAbsolute(requested)) return res.status(400).send('Invalid file');
  const filePath = path.resolve(baseDir, requested);
  if (!filePath.startsWith(path.resolve(baseDir) + path.sep)) return res.status(400).send('Invalid file');
  res.send(fs.readFileSync(filePath, "utf8")); });
  res.send(fs.readFileSync(filePath, "utf8"));
});

/* =========================================================
   8. INSECURE DESERIALIZATION
========================================================= */
const obj = (() => {
  try { return JSON.parse(req.body.data); } catch (err) { return {}; }
})();
  try {
    const obj = JSON.parse(req.body.data); if (typeof obj !== 'object' || obj === null) throw new Error('Invalid payload');
    res.json(obj);
  } catch (e) { res.status(400).send('Invalid JSON'); }
});
  const obj = eval("(" + req.body.data + ")");
  res.json(obj);
});

/* =========================================================
const expr = String(req.query.expr || '');
if (!/^[0-9+\-*/%().\s]+$/.test(expr)) return res.status(400).send('Invalid expression');
let result;
try { result = Function('"use strict"; return (' + expr + ')')(); } catch (e) { return res.status(400).send('Error evaluating expression'); }
res.send('Result: ' + result);
========================================================= */
const expr = (req.query.expr || '').replace(/\s+/g,''); if(!/^[0-9+\-*/().]+$/.test(expr)) return res.status(400).send('Invalid expression');
const tokens = expr.match(/\d+(\.\d+)?|[+\-*/()]/g) || [];
const output = []; const ops = []; const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
tokens.forEach(t=>{ if(/\d/.test(t)) output.push(parseFloat(t)); else if('+-*/'.includes(t)){ while(ops.length && ops[ops.length-1] !== '(' && prec[ops[ops.length-1]] >= prec[t]) output.push(ops.pop()); ops.push(t); } else if(t === '(') ops.push(t); else if(t === ')'){ while(ops.length && ops[ops.length-1] !== '(') output.push(ops.pop()); ops.pop(); } });
while(ops.length) output.push(ops.pop());
const valStack = []; output.forEach(tok=>{ if(typeof tok === 'number') valStack.push(tok); else { const b = valStack.pop(); const a = valStack.pop(); valStack.push(tok === '+' ? a + b : tok === '-' ? a - b : tok === '*' ? a * b : a / b); } });
const result = valStack[0]; res.send('Result: ' + result);
  const expr = String(req.query.expr || "");
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return res.status(400).send("Invalid expression");
  try { const result = Function('"use strict";return ('+expr+')')(); return res.send("Result: " + result); }
  catch (e) { return res.status(400).send("Evaluation error"); }
});
  const result = eval(req.query.expr);
  res.send("Result: " + result);
});

/* =========================================================
   10. OPEN REDIRECT
========================================================= */
const allowedRedirects = ['/home','/dashboard','https://www.example.com/page1'];
app.get("/redirect", (req, res) => {
  const url = (req.query.url || '').toString();
  const decoded = decodeURIComponent(url);
  // Allow only same-origin relative paths or explicitly allowlisted absolute URLs
  if (decoded.startsWith('/') || allowedRedirects.includes(decoded)) return res.redirect(decoded);
  res.status(400).send('Invalid redirect URL');
});
  res.redirect(req.query.url);
});

/* =========================================================
   11. SERVER-SIDE REQUEST FORGERY (SSRF)
========================================================= */
const allowedHosts = new Set(["example.com","api.example.com"]);
try {
  const url = new URL(req.query.url);
  if (!["http:","https:"].includes(url.protocol) || !allowedHosts.has(url.hostname)) throw new Error("disallowed");
  const response = await axios.get(url.toString());
  res.send(response.data);
} catch (e) { res.status(400).send("Invalid or disallowed URL"); }
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
app.post("/jwt", (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, JWT_SECRET, { algorithms: ["HS256"] });
    res.json(decoded);
  } catch (err) {
    res.status(401).send("Invalid token");
  }
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
