const express = require('express');

const router = express.Router();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

// 데이터베이스 연결
const { sequelize, testConnection } = require('./config/database');

const app = express();

// JSON 파싱 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static 파일 서빙
app.use('/static', express.static('static'));

const MusinsaController = require('./controllers/musinsa.controller.js');
const PostController = require('./controllers/post.controller.js');
const ReturnController = require('./controllers/return.controller.js');
const EzAdminController = require('./controllers/ezAdmin.controller.js');

const musinsaController = new MusinsaController();
const postController = new PostController();
const returnController = new ReturnController();
const ezAdminController = new EzAdminController();

app.get('/', (req, res) => {res.send('Hello World!');});

app.get('/return/musinsa/claimNumber/:orderNumber/:serialNumber', musinsaController.getClaimNumber);
app.post('/musinsa/login', musinsaController.login);
app.get('/musinsa/claimList', musinsaController.getClaimList);
app.post('/ezAdmin/login', ezAdminController.login);
app.get('/ezAdmin/csList', ezAdminController.getEzaAdminCsList);
app.get('/ezAdmin/sentList', ezAdminController.getCountOfSentList);
app.post('/return/musinsa/process', musinsaController.processCheckList);
// 반송장으로 원송장번호 조회
app.get('/return/post/:returnTraceNumber', postController.getOriginalTraceNumber);
// 개발중
app.get('/return/info/post/:originalTraceNumber', postController.getInfoByTraceNumber);
// 서버내 csList 업데이트
app.post('/return/musinsa/csList', musinsaController.updateCsList);
app.post('/return/ezAdmin/csList', ezAdminController.updateCsList);
// csList 파일 요청
app.get('/return/musinsa/csList', returnController.getMusinsaCsListForReturn);
app.get('/return/ezAdmin/csList', returnController.getEzAdminCsListForReturn);

const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  
  // 데이터베이스 연결 테스트
  await testConnection();
});


