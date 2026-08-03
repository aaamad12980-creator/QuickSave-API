'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const routes = require('./routes/index.routes');
const requestLogger = require('./middlewares/requestLogger.middleware');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
  })
);

app.use(rateLimiter);

app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));

app.use(requestLogger);

app.disable('x-powered-by');

app.get('/test', (req, res) => {
  res.type('html').send('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>اختبار</title><style>body{font-family:sans-serif;background:#111;color:#eee;padding:16px}button{background:#e11d1d;color:white;border:none;padding:14px 20px;border-radius:8px;font-size:16px;width:100%;margin:8px 0}pre{background:#000;color:#0f0;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font-size:13px}input{width:100%;padding:12px;margin:8px 0;border-radius:8px;border:none;font-size:16px}</style></head><body><h2>اختبار الباك إند</h2><h3>بحث في فيسبوك</h3><input id="fbQuery" value="مسيرة دمياط"><button onclick="testSearch(\\'fbQuery\\',\\'facebook\\')">جرب فيسبوك</button><h3>بحث في يوتيوب</h3><input id="ytQuery" value="ميسي"><button onclick="testSearch(\\'ytQuery\\',\\'youtube\\')">جرب يوتيوب</button><h3>النتيجة:</h3><pre id="output">اضغط زرار...</pre><script>async function testSearch(inputId, platform){const out=document.getElementById("output");const q=document.getElementById(inputId).value;out.textContent="جاري الإرسال...";try{const res=await fetch("/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,platform})});const data=await res.json();out.textContent="Status: "+res.status+"\\n\\n"+JSON.stringify(data,null,2);}catch(err){out.textContent="خطأ: "+err.message;}}</script></body></html>');
});

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
