# 1. Node.js 공식 이미지 사용 (LTS 버전 권장)
FROM node:18-alpine

# 2. 작업 디렉토리 생성
WORKDIR /

# 3. package.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install --production

# 4. 나머지 소스 복사
COPY . .

# 5. 앱 실행 포트 노출
EXPOSE 10001

# 6. 앱 실행 명령
CMD ["node", "app.js"]