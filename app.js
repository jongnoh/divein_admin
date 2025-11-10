const express = require('express');
const dotenv = require('dotenv');
const cron = require('node-cron');
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
const musinsaController = new MusinsaController();
const postController = new PostController();

app.get('/', (req, res) => {res.send('Hello World!');});

app.post('/musinsa/login', musinsaController.login);
app.post('/musinsa/refresh-token', musinsaController.refreshAccessToken);
app.get('/musinsa/update-claims', musinsaController.updateClaims);

const PORT = process.env.PORT || 3000;

testConnection()
  .then((connected) => {
    if (!connected) {
      console.error('DB 연결 실패. 서버를 종료합니다.');
      process.exit(1);
    }
  });

// 서버 시작
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  
});


// cron.schedule('0 0 * * *', async () => {
//     console.log('매일 자정에 무신사 로그인 작업 시작');
//     try {
//         await musinsaController.login();
//         console.log('무신사 로그인 작업 완료');
//     } catch (error) {
//         console.error('무신사 로그인 작업 중 오류 발생:', error);
//     }
// });
// cron.schedule('*/3 * * * *', async () => {
//     console.log('매 3분마다 무신사 토큰 갱신');
//     try {

//         await musinsaController.refreshAccessToken();
//         console.log('무신사 토큰 갱신 완료');
//     } catch (error) {
//         console.error('무신사 토큰 갱신 중 오류 발생:', error);
//     }
// });
