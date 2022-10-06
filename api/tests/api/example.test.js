const axios = require("axios").create({
  validateStatus: false,
})
const { host } = require("../testConfig")

describe("healthcheck", () => {
  it("should always pass", () => {
    expect(true).toBeTruthy()
  })
  it("API healthcheck", async () => {
    const response = await axios.get(`${host}/api/healthcheck`)
    expect(response.status).toEqual(200)
    expect(response.data.status).toEqual("ok")
  })
})
