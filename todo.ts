/// <reference path="./typings/mithril/mithril.d.ts" />

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
admin.initializeApp(functions.config().firebase);

export const firestoreInstance = admin.firestore();


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
  class ViewModel {
    list: Array<Todo>
    description: MithrilProperty<string>
    constructor() {
      function update(fetchedData) {
        this.list = fetchedData.map(function (itemObj) {
          // debugger
          return new Todo(itemObj.description)
        })

        this.description = m.prop("")        
      }

      // var fetchedData = storage.get()
      // update(fetchedData)

      storage.get().then(
        function(documentSnapshot) {
          var fetchedData = JSON.parse(documentSnapshot.toString())
          update(fetchedData)
        }
      )
    }
    add() {
      // This is an unfortunate thing, but we have to use vm instead of this
      if (!vm.description()) return
      vm.list.push(new Todo(vm.description()))
      storage.put(vm.list)
      vm.description("")
    }
    remove(i: number) {
      return () => { vm.list.splice(i, 1) }
    }
  }

  var STORAGE_ID = 'todos-mithril'
  var storage = {
    get: function () {
      // return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]')
      return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").get()
    },
    put: function (todos) {
      // localStorage.setItem(STORAGE_ID, JSON.stringify(todos))
      firestoreInstance.collection(STORAGE_ID).doc("singleton_list").set(todos)
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
}

//initialize the application
m.module(document.body, TodoApp)