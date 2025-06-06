本系統可以透過docker或npm啟動

使用docker-compose：
在docker-compose.yml的同一層新增.env檔案，參考.env.example裡的設定
minio和postgres都已包含在docker-compose內，如需https可自行添加ngnix或traefik等服務
完成.env檔案後直接以docker-compose up指定啟動系統

使用yarn（可使用npm或其他套件管理器替換）：
安裝minio和postgres服務，並在postgres中建立資料庫
在packages/revo-server下新增.env檔案，同樣參考.env.example裡的設定，將minio和postgres的連線資訊填入
在和本readme.md檔案同一層使用指定yarn install安裝相依套件後，使用yarn start啟動系統
