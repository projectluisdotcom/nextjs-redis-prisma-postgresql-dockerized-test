const axios = require("axios").create({
  validateStatus: false,
})
const { host } = require("../testConfig")
const { reset, disconnect, createMockUser } = require("../helper/db")

let token = ""

describe("people", () => {
  beforeAll(async () => {
    await reset()
    await createMockUser("user-1")

    const { data } = await axios.post(`${host}/api/auth/signin`, {
      username: "user-1",
      password: "password-1",
    })
    token = data.JWT
  })

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
    const parent = await axios({
      url: `${host}/api/department`,
      method: "POST",
      headers: { "authorization": token },
      data: {
        name: "dep-1",
      }
    })
    const child = await axios({
      url: `${host}/api/department`,
      method: "POST",
      headers: { "authorization": token },
      data: {
        name: "subDep-1",
        parentId: parent.data.id,
      }
    })

    const create = await axios({
      url: `${host}/api/people`,
      method: "POST",
      data: {
        name: "person-1",
        salary: 20,
        isOnContract: true,
        currency: "USD",
        departmentId: parent.data.id,
        subDepartmentId: child.data.id,
      },
      headers: { "authorization": token },
    })

    expect(create.status).toEqual(200)
    expect(create.data.id).toEqual(expect.any(String))

    const get = await axios({
      url: `${host}/api/people/${create.data.id}`,
      method: "GET",
      headers: { "authorization": token }
    })

    expect(get.status).toEqual(200)
    expect(get.data.name).toEqual("person-1")
    expect(get.data.salary).toEqual(20)
    expect(get.data.isOnContract).toEqual(true)
    expect(get.data.departmentId).toEqual(parent.data.id)
    expect(get.data.subDepartmentId).toEqual(child.data.id)

    const del = await axios({
      url: `${host}/api/people/${get.data.id}`,
      method: "DELETE",
      headers: { "authorization": token }
    })

    expect(del.status).toEqual(200)
  })
  it("not found", async () => {
    const get = await axios({
      url: `${host}/api/people/non-existent-id`,
      method: "GET",
      headers: { "authorization": token }
    })

    expect(get.status).toEqual(404)
  })
})
