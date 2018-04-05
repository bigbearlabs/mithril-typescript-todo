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
import firebase = require("firebase")
import 'firebase/firestore'

import * as m from 'mithril'


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


const firestoreInstance = firebase.firestore()
firebase.initializeApp(config)



interface MithrilProperty<T> {
    (value?: T): T
}


module TodoApp {

  var vm: ViewModel

  class Todo {
    description: MithrilProperty<string>
    done: MithrilProperty<boolean>
    constructor(description: string) {
      this.description = m.prop(description)
      this.done = m.prop(false)
    }
  }

  const storage_firebase = {
    get: function () {
      return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").get()
    },
    put: function (todos: Todo[]) {
      return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").set(todos)
    }
  }

  class ViewModel {
    list: Array<Todo>
    description: MithrilProperty<string>
    constructor() {
      this.list = []
      this.description = m.prop("")

      const updateTo = (fetchedData: [any]) => {
        this.list = fetchedData.map( (itemObj) => {
          // debugger
          return new Todo(itemObj.description)
        })

        this.description = m.prop("")  // STUB
      }

      storage.get().then( (documentSnapshot) => {
        // const fetchedData = JSON.parse(documentSnapshot.toString())  // firestore
        const data = JSON.parse(documentSnapshot.toString()) 
        updateTo(data)
      })
    }
    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.description()) return
      vm.list.push(new Todo(vm.description()))
      storage.put(vm.list)
      vm.description("")  // ?
    }
    remove(i: number) {
      return () => { vm.list.splice(i, 1) }
    }
  }

  export function controller() {
    vm = new ViewModel()
  }
  export function view() {
    return m("body", [
      m("div.container", [
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
    ]);
  }


  const storage = 
    storage_firebase  // UNFINISHED
  // {
  //   get: function () {
  //     return Promise.resolve(JSON.parse(localStorage.getItem(STORAGE_ID) || '[]'))
  //   },
  //   put: function (todos: Todo[]) {
  //     return Promise.resolve(localStorage.setItem(STORAGE_ID, JSON.stringify(todos)))
  //   }
  // }


}

//initialize the application
m.module(document.body, TodoApp)
