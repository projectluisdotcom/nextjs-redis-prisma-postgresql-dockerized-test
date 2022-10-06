const axios = require("axios").create({
  validateStatus: false,
})
const { host } = require("../testConfig")
const { reset, disconnect, createMockUser } = require("../helper/db")

describe("auth", () => {
  beforeAll(async () => {
    await reset()
    await createMockUser("user-1")
  })

  afterAll(async () => {
    await disconnect()
  })

  it("can NOT access without credentials", async () => {
    const response = await axios.get(`${host}/api/people/stats`)
    expect(response.status).toEqual(401)
  })
  it("can access unprotected path", async () => {
    const response = await axios.get(`${host}/api/healthcheck`)
    expect(response.status).toEqual(200)
  })
  it("can NOT access with INVALID credentials", async () => {
    const response = await axios({
      url: `${host}/api/people/stats`,
      method: "GET",
      headers: {
        "authorization": "invalid-token",
      },
    })
    expect(response.status).toEqual(401)
  })
  it("can access with credentials", async () => {
    const { data, status } = await axios.post(`${host}/api/auth/signin`, {
      username: "user-1",
      password: "password-1",
    })

    expect(status).toEqual(200)
    expect(data.JWT).toEqual(expect.any(String))
    expect(data.refresh).toEqual(expect.any(String))

    const response = await axios({
      url: `${host}/api/people/stats`,
      method: "GET",
      headers: {
        "authorization": data.JWT,
      },
    })
    expect(response.status).toEqual(200)
    expect(response.data).toEqual({ min: 0, max: 0, mean: 0 })
  })
})
