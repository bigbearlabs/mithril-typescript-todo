// NOTE
// setup:
//   ```
//   npm install
//   ```
//
// enter devmode:
//    `npm run dev`



// UNFINISHED couldn't configure properly.
// import firebase = require("firebase")
// import 'firebase/firestore'

import * as m from 'mithril'
import * as prop from 'mithril/stream'

import {Component} from 'mithril'


type MithrilProperty<T> = (value?: T) => T


namespace TaskList {

  let vm: ViewModel

  class Task {
    description: MithrilProperty<string>
    done: MithrilProperty<boolean>
    constructor(description: string) {
      this.description = prop(description)
      this.done = prop(false)
    }
  }

  class ViewModel {
    listId: string
    tasks: Task[]
    newTaskDescription: MithrilProperty<string>

    constructor(listId: string) {
      this.listId = listId
      this.tasks = []
      this.newTaskDescription = prop("")

      storage.get().then((tasks: Task[]) => {
        this.tasks = tasks
        m.redraw()
      })
    }

    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.newTaskDescription()) { return }
      vm.tasks.push(new Task(vm.newTaskDescription()))
      storage.put(vm.tasks)
      vm.newTaskDescription("")  // clear the input field.
    }
    remove(i: number) {
      return () => { vm.tasks.splice(i, 1) }
    }
  }

  export const component: Component<{id: string}, {}> = {

    oninit(vnode) {
      const listId = vnode.attrs.id
      vm = new ViewModel(listId)
    },

    view(vnode) {
      return m("div.container", [
        m("span", "List " + vnode.attrs.id),
        m("div.row", [
          m("div.col-md-6.col-md-offset-3", [
            m("div.input-group", [
              m("input.form-control", {onchange: m.withAttr("value", vm.newTaskDescription), value: vm.newTaskDescription()}),
              m("span.input-group-btn", [
                m("button.btn.btn-primary", {onclick: vm.add}, "Add")
              ])
            ]),
            m("ul.list-group", [
              vm.tasks.map((task, index) => {
                return m("li.list-group-item.row", [
                  m("div.col-xs-3.col-sm-3", [
                    m("input[type=checkbox]", {onclick: m.withAttr("checked", task.done), checked: task.done()})
                  ]),
                  m("div.col-xs-6.col-sm-6", [
                    m("span", {style: {textDecoration: task.done() ? "line-through" : "none"}}, task.description()),
                  ]),
                  m("button.btn.btn-danger.pull-right", {onclick: vm.remove(index)}, "Remove")
                ])
              })
            ])
          ])
        ])
      ])
    }

  }


  const STORAGE_ID = 'todos-mithril'

  // firebase-based persistence.
  const config = {
    apiKey: "AIzaSyDqSBRoeSqBcom-hjgt338Gu7Egkak1mXY",
    authDomain: "sample-9dfce.firebaseapp.com",
    databaseURL: "https://sample-9dfce.firebaseio.com",
    projectId: "sample-9dfce",
    storageBucket: "sample-9dfce.appspot.com",
    messagingSenderId: "473506143209"
  }
  // UNFINISHED couldn't configure properly.
  // const firestoreInstance = firebase.firestore()
  // firebase.initializeApp(config)
  // const storage_firebase = {
  //   get: function () {
  //     return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").get()
  //   },
  //   put: function (todos: Todo[]) {
  //     return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").set(todos)
  //   }
  // }

  // const storage = storage_firebase  // UNFINISHED
  const storage = {
    get(): Promise<Task[]> {
      const itemObjsJson = localStorage.getItem(STORAGE_ID) || '[]'
      const itemObjs = JSON.parse(itemObjsJson)
      const tasks = itemObjs.map( (obj: any) => {
        return new Task(obj.description)
      })
      return Promise.resolve(tasks)
    },
    put(tasks: Task[]) {
      return Promise.resolve(localStorage.setItem(STORAGE_ID, JSON.stringify(tasks)))
    }
  }

}



namespace TaskListCollection {

  let vm: ViewModel

  class TaskListCollectionItem {
    description: MithrilProperty<string>
    constructor(description: string) {
      this.description = prop(description)
    }
  }

  class ViewModel {
    lists: TaskListCollectionItem[]
    newListDescription: MithrilProperty<string>
    constructor() {
      this.lists = []
      this.newListDescription = prop("")

    }
    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.newListDescription()) { return }
      vm.lists.push(new TaskListCollectionItem(vm.newListDescription()))
      // storage.put(vm.list)
      vm.newListDescription("")
    }
    remove(i: number) {
      return () => { vm.lists.splice(i, 1) }
    }
  }

  export const component: Component<{id: string}, {}> = {
    oninit() {
      vm = new ViewModel()
    },
    view() {
      return m("div.container", [
        m("span", "Task Lists"),
        m("div.row", [
          m("div.col-md-6.col-md-offset-3", [
            m("div.input-group", [
              m("input.form-control", {onchange: m.withAttr("value", vm.newListDescription), value: vm.newListDescription()}),
              m("span.input-group-btn", [
                m("button.btn.btn-primary", {onclick: vm.add}, "Add")
              ])
            ]),
            m("ul.list-group", [
              vm.lists.map((list, index) => {
                return m("li.list-group-item.row", [
                  m("div.col-xs-6.col-sm-6", [
                    m("a", {
                        style: {},
                        href: "/tasklist/" + list.description(),
                        oncreate: m.route.link
                      },
                      list.description()),
                  ]),
                  m("button.btn.btn-danger.pull-right", {onclick: vm.remove(index)}, "Remove")
                ])
              })
            ])
          ])
        ])
      ])
    }
  }

}



m.route(document.body, "/tasklist", {
    "/tasklist": TaskListCollection.component,
    "/tasklist/:id": TaskList.component,
})
