import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return (`
    <html>
      <head>
        <title>My API</title>
      </head>
      <body>
        <header>
          <h1 style="text-align:center">API OPEX GMF AEROASIA</h1>
        </header>
        <main>
          <p>This is the main content of your API.</p>
          <!-- Add more HTML content as needed -->
        </main>
        <footer>
          <p>Copyright © 2023 Your Company</p>
        </footer>
      </body>
    </html>
  `);
  }
}
