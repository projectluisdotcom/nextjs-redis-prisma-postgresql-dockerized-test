const axios = require("axios").create({
  validateStatus: false,
})
const { host } = require("../testConfig")
const { reset, disconnect, createMockUser } = require("../helper/db")

let token = ""

const login = async () => {
  await createMockUser("user-1")
  const { data } = await axios.post(`${host}/api/auth/signin`, {
    username: "user-1",
    password: "password-1",
  })
  token = data.JWT
}

describe("stats", () => {
  beforeAll(async () => {
    await reset()
    await login()

    const [d1, d2, unusedD3] = await Promise.all([
      axios.post(`${host}/api/department`, 
        { name: "dep-1", },
        { headers: { "authorization": token } }
      ),
      axios.post(`${host}/api/department`, 
        { name: "dep-2", },
        { headers: { "authorization": token } }
      ),
      axios.post(`${host}/api/department`, 
        { name: "unused-dep-3", },
        { headers: { "authorization": token } }
      ),
    ])

    const [subDepartment, unusedSubDepartment] = await Promise.all([
      axios.post(`${host}/api/department`, {
        name: "subDep-1", parentId: d2.data.id,
      }, { headers: { "authorization": token } }),
      axios.post(`${host}/api/department`, {
        name: "unused-subDep-2", parentId: unusedD3.data.id,
      }, { headers: { "authorization": token } })
    ])

    await Promise.all([
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-0",
          salary: 10,
          isOnContract: false,
          currency: "USD",
          departmentId: d1.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-1",
          salary: 15,
          isOnContract: true,
          currency: "USD",
          departmentId: d1.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-2",
          salary: 20,
          isOnContract: false,
          currency: "USD",
          departmentId: d1.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-3",
          salary: 20,
          isOnContract: true,
          currency: "USD",
          departmentId: d1.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-4",
          salary: 30,
          isOnContract: false,
          currency: "USD",
          departmentId: d1.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-5",
          salary: 20,
          isOnContract: true,
          currency: "USD",
          departmentId: d2.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-6",
          salary: 30,
          isOnContract: false,
          currency: "USD",
          departmentId: d2.data.id,
          subDepartmentId: subDepartment.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-7",
          salary: 30,
          isOnContract: false,
          currency: "USD",
          departmentId: d2.data.id,
          subDepartmentId: subDepartment.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-8",
          salary: 35,
          isOnContract: true,
          currency: "USD",
          departmentId: d2.data.id,
          subDepartmentId: subDepartment.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-9",
          salary: 30,
          isOnContract: false,
          currency: "USD",
          departmentId: d2.data.id,
          subDepartmentId: subDepartment.data.id,
        },
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people`,
        method: "POST",
        data: {
          name: "people-10",
          salary: 40,
          isOnContract: false,
          currency: "USD",
          departmentId: d2.data.id,
        },
        headers: { "authorization": token },
      }),
    ])
  }, 30000)

  afterAll(async () => {
    await disconnect()
  })

  it("protected paths", async () => {
    const { status } = await axios.get(`${host}/api/people/stats`)
    expect(status).toEqual(401)
  })
  it("get stats", async () => {
    const { data, status } = await axios({
      url: `${host}/api/people/stats`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      mean: 30,
      max: 40,
      min: 10,
    })
  })

  it("get stats where is on contract", async () => {
    const { data, status } = await axios({
      url: `${host}/api/people/stats?isoncontract=true`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      mean: 20,
      max: 35,
      min: 15,
    })
  })

  it("get stats where is NOT on contract", async () => {
    const { data, status } = await axios({
      url: `${host}/api/people/stats?isoncontract=false`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      mean: 30,
      max: 40,
      min: 10,
    })
  })

  it("get stats group by department", async () => {
    const { data, status } = await axios({
      url: `${host}/api/people/stats?groupbydepartment`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(status).toEqual(200)
    expect(data[0]).toEqual({
      department: "dep-1",
      parent: null,
      stats: { mean: 20, min: 10, max: 30, },
    })
    expect(data[1]).toEqual({
      department: "dep-2",
      parent: null,
      stats: { mean: 30, min: 20, max: 40 },
    })
    expect(data[2]).toEqual({
      department: "unused-dep-3",
      parent: null,
      stats: { mean: 0, min: 0, max: 0 },
    })
  })

  it("get stats groupby department and subdepartment", async () => {
    const { data, status } = await axios({
      url: `${host}/api/people/stats?groupbysubdepartment`,
      method: "GET",
      headers: { "authorization": token },
    })

    expect(status).toEqual(200)
    expect(data[0]).toEqual({
      department: "dep-1",
      parent: null,
      stats: { mean: 20, min: 10, max: 30, },
    })
    expect(data[1]).toEqual({
      department: "dep-2",
      parent: null,
      stats: { mean: 30, min: 20, max: 40 },
    })
    expect(data[2]).toEqual({
      department: "unused-dep-3",
      parent: null,
      stats: { mean: 0, min: 0, max: 0 },
    })
    expect(data[3]).toEqual({
      department: "subDep-1",
      parent: "dep-2",
      stats: { mean: 30, min: 30, max: 35 },
    })
    expect(data[4]).toEqual({
      department: "unused-subDep-2",
      parent: "unused-dep-3",
      stats: { mean: 0, min: 0, max: 0 },
    })
  })

  it("returns empty with no data", async () => {
    await reset()
    await login()

    const [stats, isOnContract, groupbydepartment, groupbysubdepartment] = await Promise.all([
      axios({
        url: `${host}/api/people/stats`,
        method: "GET",
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people/stats?isoncontract=true`,
        method: "GET",
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people/stats?groupbydepartment`,
        method: "GET",
        headers: { "authorization": token },
      }),
      axios({
        url: `${host}/api/people/stats?groupbysubdepartment`,
        method: "GET",
        headers: { "authorization": token },
      }),
    ])
    
    expect(stats.status).toEqual(200)
    expect(isOnContract.status).toEqual(200)
    expect(groupbydepartment.status).toEqual(200)
    expect(groupbysubdepartment.status).toEqual(200)

    expect(stats.data).toEqual({ mean: 0, min: 0, max: 0, })
    expect(isOnContract.data).toEqual({ mean: 0, min: 0, max: 0, })
    expect(groupbydepartment.data).toEqual([])
    expect(groupbysubdepartment.data).toEqual([])
  })
})
