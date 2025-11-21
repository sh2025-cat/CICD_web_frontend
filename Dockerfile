FROM nginx:alpine

# nginx 기본 설정 제거
RUN rm -rf /etc/nginx/conf.d/*

# 커스텀 SPA 설정 적용
COPY nginx.conf /etc/nginx/conf.d/default.conf

# GitHub Actions에서 빌드한 dist 폴더 복사
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]