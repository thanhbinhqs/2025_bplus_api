import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from "socket.io-client";

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

describe('SocketGateway', () => {
  // let gateway: SocketGateway;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [SocketGateway, SocketService],
  //   }).compile();

  //   gateway = module.get<SocketGateway>(SocketGateway);
  // });

  // it('should be defined', () => {
  //   expect(gateway).toBeDefined();
  // });
  let gateway: SocketGateway;
  let app: INestApplication;
  let ioClient: Socket;

  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(SocketGateway);
    // Get the gateway instance from the app instance
    gateway = app.get<SocketGateway>(SocketGateway);
    // Create a new client that will interact with the gateway
    ioClient = io("http://localhost:3000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(gateway).toBeDefined();
  });

  it('should emit "pong" on "ping"', async () => {
    ioClient.connect();
    ioClient.emit("ping", "Hello world!");
    await new Promise<void>((resolve) => {
      ioClient.on("connect", () => {
        console.log("connected");
      });
      ioClient.on("pong", (data) => {
        expect(data).toBe("Hello world!");
        resolve();
      });
    });
    ioClient.disconnect();
  });
});
