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
