import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    <html>
      <head>
        <title>API OPX</title>
      </head>
      <body>
        <header>
          <h1 style="text-align:center">API OPEX GMF AEROASIA</h1>
        </header>
        <main>
          <h3>Use for OPEX Application.</h3>
        </main>
        <footer>
          <p style="text-align:center">Copyright © 2023 xyz-loops</p>
        </footer>
      </body>
    </html>
  `;
  }
}
