"use strict";
/// <reference path="./typings/mithril/mithril.d.ts" />
exports.__esModule = true;
// NOTE compile with browserify todo.ts -p [ tsify --noImplicitAny ] -d > bundle.js
var firestore = require("@google-cloud/firestore");
// FIXME results in a throw due to an undefined object --
// configure properly and re-test.
var firestoreInstance = new firestore.Firestore({
    projectId: 'YOUR_PROJECT_ID',
    keyFilename: '/path/to/keyfile.json'
});
var TodoApp;
(function (TodoApp) {
    var vm;
    var Todo = /** @class */ (function () {
        function Todo(description) {
            this.description = m.prop(description);
            this.done = m.prop(false);
        }
        return Todo;
    }());
    var ViewModel = /** @class */ (function () {
        function ViewModel() {
            function updateTo(fetchedData) {
                this.list = fetchedData.map(function (itemObj) {
                    // debugger
                    return new Todo(itemObj.description);
                });
                this.description = m.prop(""); // STUB
            }
            storage.get().then(function (documentSnapshot) {
                var fetchedData = JSON.parse(documentSnapshot.toString());
                updateTo(fetchedData);
            });
        }
        ViewModel.prototype.add = function () {
            // This is an unfortunate thing, but we have to use vm instead of this
            if (!vm.description())
                return;
            vm.list.push(new Todo(vm.description()));
            storage.put(vm.list);
            vm.description(""); // ?
        };
        ViewModel.prototype.remove = function (i) {
            return function () { vm.list.splice(i, 1); };
        };
        return ViewModel;
    }());
    var STORAGE_ID = 'todos-mithril';
    var storage = {
        get: function () {
            // return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]')
            return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").get();
        },
        put: function (todos) {
            // localStorage.setItem(STORAGE_ID, JSON.stringify(todos))
            return firestoreInstance.collection(STORAGE_ID).doc("singleton_list").set(todos);
        }
    };
    function controller() {
        vm = new ViewModel();
    }
    TodoApp.controller = controller;
    function view() {
        return m("body", [
            m("div.container", [
                m("div.row", [
                    m("div.col-md-6.col-md-offset-3", [
                        m("div.input-group", [
                            m("input.form-control", { onchange: m.withAttr("value", vm.description), value: vm.description() }),
                            m("span.input-group-btn", [
                                m("button.btn.btn-primary", { onclick: vm.add }, "Add")
                            ])
                        ]),
                        m("ul.list-group", [
                            vm.list.map(function (task, index) {
                                return m("li.list-group-item.row", [
                                    m("div.col-xs-3.col-sm-3", [
                                        m("input[type=checkbox]", { onclick: m.withAttr("checked", task.done), checked: task.done() })
                                    ]),
                                    m("div.col-xs-6.col-sm-6", [
                                        m("span", { style: { textDecoration: task.done() ? "line-through" : "none" } }, task.description()),
                                    ]),
                                    m("button.btn.btn-danger.pull-right", { onclick: vm.remove(index) }, "Remove")
                                ]);
                            })
                        ])
                    ])
                ])
            ])
        ]);
    }
    TodoApp.view = view;
})(TodoApp || (TodoApp = {}));
//initialize the application
m.module(document.body, TodoApp);
