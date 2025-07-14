class WaitForRequest {
  constructor(page) {
    this.page = page;
    this.requests = [];

    this.page.on("request", (request) => {
      if (request.url().includes("demoajax")) {
        this.requests.push(request.url());
      }
    });

    this.page.on("response", (response) => {
      const index = this.requests.indexOf(response.url());
      if (index > -1) {
        this.requests.splice(index, 1);
      }
    });
  }
  async waitForAllRequestsFinished() {
    while (this.requests.length > 0) {
      await this.page.waitForResponse(this.requests[0]);
    }
  }
}

module.exports = WaitForRequest;
