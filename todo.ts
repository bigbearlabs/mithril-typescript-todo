/// <reference path="./typings/mithril/mithril.d.ts" />


// NOTE 
// setup:
//   ```
//   npm install
//   tsd install
//   ```
// 
// enter devmode:
//    `npm run dev &; python -m SimpleHTTPServer`


// UNFINISHED couldn't configure properly.
// import firebase = require("firebase")
// import 'firebase/firestore'

import * as m from 'mithril'
import * as prop from 'mithril/stream'

interface MithrilProperty<T> {
    (value?: T): T
}


// TodoCollection
module TodoApp {

  var vm: ViewModel

  class Todo {
    description: MithrilProperty<string>
    done: MithrilProperty<boolean>
    constructor(description: string) {
      this.description = prop(description)
      this.done = prop(false)
    }
  }

  class ViewModel {
    listId: String
    todos: Array<Todo>
    description: MithrilProperty<string>
    constructor(listId: String) {
      this.listId = listId
      this.todos = []
      this.description = prop("")

      // const updateTo = (fetchedData: [any]) => {
      //   this.todos = fetchedData.map( (itemObj) => {
      //     // debugger
      //     return new Todo(itemObj.description)
      //   })

      //   this.description = prop("")  // STUB
      // }

      // storage.get().then( (fetchedData) => {
      //   // const fetchedData = JSON.parse(documentSnapshot.toString())  // firestore
      //   updateTo(fetchedData)
      // })
    }
    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.description()) return
      vm.todos.push(new Todo(vm.description()))
      storage.put(vm.todos)
      vm.description("")  // ?
    }
    remove(i: number) {
      return () => { vm.todos.splice(i, 1) }
    }
  }

  export function oninit() {
    const listId = (new URL(document.location.href)).searchParams.get("id")
    vm = new ViewModel(listId)
  }
  export function view() {
      return m("div.container", [
        m("span", "Todo Items For List " + vm.listId),
        m("div.row", [
          m("div.col-md-6.col-md-offset-3", [
            m("div.input-group", [
              m("input.form-control", {onchange: m.withAttr("value", vm.description), value: vm.description()}),
              m("span.input-group-btn", [
                m("button.btn.btn-primary", {onclick: vm.add}, "Add")
              ])
            ]),
            m("ul.list-group", [
              vm.todos.map((task, index) => {
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


  const STORAGE_ID = 'todos-mithril'

  // firebase-based persistence.
  var config = {
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

  const storage = 
    // storage_firebase  // UNFINISHED
  {
    get: function () {
      return Promise.resolve(JSON.parse(localStorage.getItem(STORAGE_ID) || '[]'))
    },
    put: function (todos: Todo[]) {
      return Promise.resolve(localStorage.setItem(STORAGE_ID, JSON.stringify(todos)))
    }
  }


}



// ListCollection
module ListsApp {

  var vm: ViewModel

  class Todo {
    description: MithrilProperty<string>
    constructor(description: string) {
      this.description = prop(description)
    }
  }

  class ViewModel {
    list: Array<Todo>
    description: MithrilProperty<string>
    constructor() {
      this.list = []
      this.description = prop("")

    }
    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.description()) return
      vm.list.push(new Todo(vm.description()))
      // storage.put(vm.list)
      vm.description("")  // ?
    }
    remove(i: number) {
      return () => { vm.list.splice(i, 1) }
    }
  }

  export function oninit() {
    vm = new ViewModel()
  }
  export function view() {
      return m("div.container", [
        m("span", "Todo Lists"),
        m("div.row", [
          m("div.col-md-6.col-md-offset-3", [
            m("div.input-group", [
              m("input.form-control", {onchange: m.withAttr("value", vm.description), value: vm.description()}),
              m("span.input-group-btn", [
                m("button.btn.btn-primary", {onclick: vm.add}, "Add")
              ])
            ]),
            m("ul.list-group", [
              vm.list.map((task, index) => {
                return m("li.list-group-item.row", [
                  m("div.col-xs-6.col-sm-6", [
                    m("a", {
                        style: {}, 
                        href: "/todo/" + task.description(), 
                        oncreate: m.route.link
                      }, 
                      task.description()),
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



//initialize the application
// if (document.location.href.indexOf("todo") > -1) {
//   m.module(document.body, TodoApp)  
// } else if (document.location.href.indexOf("lists") > -1) {
//   m.module(document.body, ListsApp)
// }

m.route(document.body, "/", {
    "/": ListsApp,
    "/todo/:id": TodoApp,
});