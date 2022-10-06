const axios = require("axios").create({
  validateStatus: false,
})
const { host } = require("../testConfig")
const { reset, disconnect, createMockUser } = require("../helper/db")

let token = ""

describe("department", () => {
  beforeAll(async () => {
    await reset()
    await createMockUser("user-1")

    const { data } = await axios.post(`${host}/api/auth/signin`, {
      username: "user-1",
      password: "password-1",
    })
    token = data.JWT
  }, 15000)

  afterAll(async () => {
    await disconnect()
  })

  it("protected paths", async () => {
    const [post, get, del] = await Promise.all([
      axios.post(`${host}/api/people`),
      axios.get(`${host}/api/people/id`),
      axios.delete(`${host}/api/people/id`),
    ])
    expect(post.status).toEqual(401)
    expect(get.status).toEqual(401)
    expect(del.status).toEqual(401)
  })
  it("crud", async () => {
    const [c1, c2] = await Promise.all([
      axios.post(`${host}/api/department`, 
        { name: "dep-1", }, 
        { headers: { "authorization": token } }
      ),
      axios.post(`${host}/api/department`, 
        { name: "dep-2", },
        { headers: { "authorization": token } }
      ),
    ])

    expect(c1.status).toEqual(200)
    expect(c1.data.id).toEqual(expect.any(String))
    expect(c2.status).toEqual(200)
    expect(c2.data.id).toEqual(expect.any(String))

    const [g1, g2] = await Promise.all([
      axios({
        url: `${host}/api/department/${c1.data.id}`,
        method: "GET",
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/department/${c2.data.id}`,
        method: "GET",
        headers: { "authorization": token },
      }),
    ])

    expect(g1.status).toEqual(200)
    expect(g1.data.name).toEqual("dep-1")
    expect(g2.status).toEqual(200)
    expect(g2.data.name).toEqual("dep-2")

    const [d1, d2] = await Promise.all([
      axios.delete(`${host}/api/department/${g1.data.id}`, { headers: { "authorization": token } }),
      axios.delete(`${host}/api/department/${g2.data.id}`, { headers: { "authorization": token } }),
    ])

    expect(d1.status).toEqual(200)
    expect(d2.status).toEqual(200)
  })
  it("subDepartment crud", async () => {
    const parent = await axios.post(
      `${host}/api/department`, 
      { name: "dep-1", },
      { headers: { "authorization": token } },
    )
    const create = await axios.post(
      `${host}/api/department`, 
      { name: "subDep-1", parentId: parent.data.id, },
      { headers: { "authorization": token } },
    )

    expect(parent.status).toEqual(200)
    expect(create.status).toEqual(200)
    
    const subDepartment = await axios({
      url: `${host}/api/department/${create.data.id}`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(subDepartment.status).toEqual(200)
    expect(subDepartment.data.id).toEqual(create.data.id)
    expect(subDepartment.data.parentId).toEqual(parent.data.id)

    const d1 = await axios.delete(`${host}/api/department/${subDepartment.data.id}`, { headers: { "authorization": token } })
    const d2 = await axios.delete(`${host}/api/department/${parent.data.id}`, { headers: { "authorization": token } })

    expect(d1.status).toEqual(200)
    expect(d2.status).toEqual(200)

    const [getAfterDelete1, getAfterDelete2] = await Promise.all([
      axios({
        url: `${host}/api/department/${parent.data.id}`,
        method: "GET",
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/department/${subDepartment.data.id}`,
        method: "GET",
        headers: { "authorization": token },
      }),
    ])

    expect(getAfterDelete1.status).toEqual(404)
    expect(getAfterDelete2.status).toEqual(404)
  })
  it("fails to create a subDepartment with non existing parent", async () => {
    const response = await axios.post(`${host}/api/department`, {
      name: "dep-1",
      parentId: "invalid-id",
    },
    { headers: { "authorization": token } })

    expect(response.status).toEqual(404)
  })
  it("not found", async () => {
    const get = await axios({
      url: `${host}/api/department/non-existent-id`,
      method: "GET",
      headers: { "authorization": token },
    })
    expect(get.status).toEqual(404)
  })
})
