/* ISSUE DATABASE CLASS

Populate by passing an array of issues (not a keyed object)
when creating a new database:

    const myDatabase = new IssueDatabase([ 
      {
        issueID = 'G1',
        ...
      },
      {
        issueID = 'G2',
        ...
      }
    ])

Or by using the importIssues method:

    const myDatabase = new IssueDatabase()
    myDatabase.importIssues([ 
      {
        issueID = 'G1',
        ...
      },
      {
        issueID = 'G2',
        ...
      }
    ]))

Databases provide the following retrieval methods:

    getAllIssues(exclude) - returns an array of all issues, optionally filtered against 'exclude' array

    getIssueByID(id) - returns a specific issue based on its ID, logs an error and returns undefined if not found

    getRandomIssue(exclude) - returns a random issue, optionally filtered against 'exclude' array

    getRandomIssues(limit, exclude) - returns an array of random issues with max 'limit' items,
      optionally filtered against 'exclude' array

All JSON-based object copying and the assignment of unique keys is handled by the database.
Returned objects are ready to use in the main game engine.

*/

let nextUniqueKey = 1000

export default class IssueDatabase {
  #Issues = {}
  static copyObject(obj) {
    return JSON.parse(JSON.stringify(obj))
  }
  static getUniqueKey() {
    return nextUniqueKey++
  }
  get IssueIndex() {
    return Object.keys(this.#Issues)
  }
  importIssues(IssueArray) {
    IssueArray.forEach((issue) => {
      this.#Issues[issue.issueID] = issue
    })
  }
  getAllIssues(exclude = [], assignUniqueKeys = true) {
    const outputArray = []
    for (const id in this.#Issues) {
      if (!exclude.includes(id)) {
        const issue = IssueDatabase.copyObject(this.#Issues[id])
        if (assignUniqueKeys) issue.uniqueKey = IssueDatabase.getUniqueKey()
        outputArray.push(issue)
      }
    }
    return outputArray
  }
  getIssueByID(id, assignUniqueKey = true) {
    if (typeof this.#Issues[id] === 'object') {
      const outputObject = IssueDatabase.copyObject(this.#Issues[id])
      if (assignUniqueKey) outputObject.uniqueKey = IssueDatabase.getUniqueKey()
      return outputObject
    } else {
      console.error('Issue does not exist: ' + id)
      return undefined
    }
  }
  getRandomIssue(exclude = [], assignUniqueKey = true) {
    const filteredIssues = this.IssueIndex.filter((id) => !exclude.includes(id))
    const outputObject = IssueDatabase.copyObject(
      this.#Issues[
        filteredIssues[Math.floor(Math.random() * filteredIssues.length)]
      ]
    )
    if (assignUniqueKey) outputObject.uniqueKey = IssueDatabase.getUniqueKey()
    return outputObject
  }
  getRandomIssues(limit = Infinity, exclude = [], assignUniqueKeys = true) {
    let filteredIssues = this.IssueIndex.filter((id) => !exclude.includes(id))
    const outputArray = []
    while (outputArray.length <= limit && filteredIssues.length > 0) {
      const issue = IssueDatabase.copyObject(
        this.#Issues[
          filteredIssues.splice(
            Math.floor(Math.random() * filteredIssues.length),
            1
          )[0]
        ]
      )
      if (assignUniqueKeys) issue.uniqueKey = IssueDatabase.getUniqueKey()
      outputArray.push(issue)
    }
    return outputArray
  }
  constructor(IssueArray) {
    if (Array.isArray(IssueArray)) this.importIssues(IssueArray)
  }
}