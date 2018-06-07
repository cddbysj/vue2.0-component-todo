const log = console.log.bind(console)

const STORAGE_KEY = 'todos-vuejs-2.0'
const todoStorage = {
	fetch() {
		let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		todos.forEach((todo, index) => todo.id = index)
		todoStorage.uid = todos.length
		return todos
	},
	save(todos) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
	}
}

const filters = {
	all(todos) {
		return todos
	},
	active(todos) {
		return todos.filter(item => !item.completed)
	},
	completed(todos) {
		return todos.filter(item => item.completed)
	}
}

const BaseInputText = {
	props: {
		value: {
			type: String,
			default: ''
		}
	},
	computed: {
		listeners() {
			var vm = this
			return Object.assign({},
				this.$listeners,
				{
					input: function(event) {
						vm.$emit('input', event.target.value)
					}
				}
			)
		}
	},
	template: `
		<input
			type="text"
			class="input"
			:value="value"
			autofocus="autofocus"
			v-on="listeners"/>
	`
}

const TodoListItem = {
	props: {
		todo: {
			type: Object,
			required: true
		},
		editedTodo: {
			type: Object
		}
	},
	directives: {
		focus(el, binding) {
			if (binding.value) {
				el.focus()
			}
		}
	},
	template: `
		<li class="todo-item"
			:class="{ completed: todo.completed, editing: todo === editedTodo }">
			<div class="view">
				<input
					class="toggle"
					type="checkbox"
					v-model="todo.completed"/>
				<label class="todo-label"
					@dblclick="$emit('edit')">
					{{ todo.text }}
				</label>
				<button
					class="remove-todo"
					@click="$emit('remove', todo.id)">
					×
				</button>
			</div>
			<input class="edit" type="text"
				v-model="todo.text"
				v-focus="todo === editedTodo"
				@blur="$emit('doneEdit')"
				@keyup.enter="$emit('doneEdit')"
				@keyup.esc="$emit('cancelEdit')"/>
		</li>
	`
}

const TodoTabs = {
	props: {
		todos: {
			type: Array
		},
		remaining: {
			type: Number
		}
	},
	data() {
		return {
			filters: ['all', 'active', 'completed']
		}
	},
	filters: {
		pluralize(n) {
			return n == 1? 'item' : 'items'
		}
	},
	template: `
		<div class="todo-tab">
			<span class="todo-count">
				<strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
			</span>
			<span	class="todo-filter">
				<span
					v-for="filter in filters"
					:key="filter"
					:class="['filter-default']"
					@click="$emit('toggleFilter', filter)"
				>
					{{ filter }}
				</span>
			</span>
			<div class="clear-completed-wrap">
				<span class="clear-completed"
					v-show="todos.length > remaining"
					@click="$emit('clearCompleted')">
					Clear completed
				</span>
			</div>
		</div>
	`
}

const TodoList = {
	components: {
		'BaseInputText': BaseInputText,
		'TodoListItem': TodoListItem,
		'TodoTabs': TodoTabs,
	},
	data() {
		return {
			newTodoText: '',
			todos: todoStorage.fetch(),
			editedTodo: null,
			visibility: 'all'
		}
	},
	watch: {
		todos: {
 			handler: function(todos) {
 				todoStorage.save(todos)
 			},
 			deep: true
		}
	},
	computed: {
		filteredTodos() {
			return filters[this.visibility](this.todos)
		},
		remaining() {
			return filters.active(this.todos).length
		},
		// 当使用计算属性来实现v-model双向绑定
		// 需要设置setter，否则Vue会报错
		allDone: {
			get() {
				return this.remaining === 0
			},
			set(value) {
				this.todos.forEach(todo => todo.completed = value)
			}
		}
	},
	methods: {
		addTodo() {
			const trimmedText = this.newTodoText.trim()
			if (trimmedText) {
				this.todos.unshift({
					id: todoStorage.uid++,
					text: trimmedText,
					completed: false
				})
				this.newTodoText = ''
			}
		},
		removeTodo(idToRemove) {
			this.todos = this.todos.filter(todo => todo.id !== idToRemove)
		},
		editTodo(todo) {
			this.beforeEditCache = todo.text
			this.editedTodo = todo
		},
		doneEdit(todo) {
			this.editedTodo = null
		},
		cancelEdit(todo) {
			todo.text = this.beforeEditCache
			this.editedTodo = null
		},
		clearCompletedTodo() {
			this.todos = this.todos.filter(item => !item.completed)
		},
		toggleFilter(filter) {
			this.visibility = filter
		}
	},
	template: `
		<div>
			<BaseInputText
				v-model="newTodoText"
				@keyup.enter="addTodo"
				placeholder="New todo here"/>
			<div v-cloak>
				<input type="checkbox"
					v-if="todos.length"
					class="toggle-all"
					v-model="allDone"/>
				<ul v-if="todos.length">
					<TodoListItem
						v-for="todo in filteredTodos"
						:key="todo.id"
						:todo="todo"
						:editedTodo="editedTodo"
						@remove="removeTodo"
						@edit="editTodo(todo)"
						@doneEdit="doneEdit(todo)"
						@cancelEdit="cancelEdit(todo)">
					</TodoListItem>
				</ul>
				<TodoTabs	v-if="todos.length"
					@toggleFilter="toggleFilter"
					@clearCompleted="clearCompletedTodo"
					:todos="todos"
					:remaining="remaining"/>
			</div>
		</div>
	`
}

new Vue({
	el: '#app',
	components: {
		'TodoList': TodoList
	},
	data: {
		author: 'Bill Wen'
	},
	template: `
		<div id="app">
			<header class="header">
				<h1>My Todo App</h1>
			</header>
			<TodoList class="todo-list"></TodoList>
			<footer class="footer">Written by {{ author }}</footer>
		</div>
	`
})

/*
	用到的知识点
	1.Vue
	2.CSS布局
	3.浏览器缓存
*/