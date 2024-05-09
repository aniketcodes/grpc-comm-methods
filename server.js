const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "protos/server.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(protoDescriptor.NewsService.service, {
  getNews: (call, callback) => {
    const response = {
      news: [
        {
          id: 1,
          title: "Sample News",
          body: "This is a sample news",
          viewCount: 101,
        },
      ],
    };
    callback(null, response);
  },
  clientStreamNews: (call, callback) => {
    let news = [];
    call.on("data", (data) => {
      news.push(data);
    });
    call.on("end", () => {
      const response = {
        news: news,
      };
      callback(null, response);
    });
  },
  biDirectionalNews: (call, callback) => {
    const news = [];
    call.on("data", (data) => {
      news.push(data);
      const response = {
        news,
      };

      call.write({ news });
    });

    call.on("end", () => {
      console.log("Bi-directional stream ended");
      call.write({ news });
    });
  },
  serverStreamNews: (call) => {
    const news = [
      {
        id: 1,
        title: "Sample News",
        body: "This is a sample news",
        viewCount: 101,
      },
      {
        id: 2,
        title: "Sample News 2",
        body: "This is a sample news",
        viewCount: 1021,
      },
      {
        id: 3,
        title: "Sample News 3",
        body: "This is a sample news",
        viewCount: 1121,
      },
    ];
    for (let i = 0; i < news.length; i++) {
      setTimeout(() => {
        call.write(news[i]);
      }, i * 1000);
    }
   // call.end();
  },
});

server.bindAsync(
  "127.0.0.1:3001",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:3001");
    server.start();
  }
);
