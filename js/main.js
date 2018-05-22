const log = console.log.bind(console)
let nextTodoId = 1
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
		}
	},
	template: `
		<li :class="['todo-item', todo.completed?'completed':'']">
			<label class="todo-label">
				<input
					type="checkbox"
					:checked="todo.completed"
					@input="$emit('toggle', todo)"/>
				{{ todo.text }}
			</label>
			<button
				class="remove-todo"
				@click="$emit('remove', todo.id)">
				×
			</button>
		</li>
	`
}

const TodoTabs = {
	props: {
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
			<span class="clear-completed"
				@click="$emit('clearCompleted')">
				Clear completed
			</span>
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
			todos: [],
			newTodoText: '',
			visibility: 'all'
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
					id: nextTodoId++,
					text: trimmedText,
					completed: false
				})
				this.newTodoText = ''
			}
		},
		toggleTodo(todo) {
			todo.completed = !todo.completed
			log(`${todo.text}.completed:${todo.completed}`)
		},
		removeTodo(idToRemove) {
			this.todos = this.todos.filter(todo => todo.id !== idToRemove)
		},
		clearCompletedTodo() {
			log(`clearCompletedTodo`)
			this.todos = this.todos.filter(item => !item.completed)
		},
		toggleFilter(filter) {
			log(`toggleFilter:${filter}`)
			this.visibility = filter
		}
	},
	template: `
		<div>
			<BaseInputText
				v-model="newTodoText"
				@keyup.enter="addTodo"
				placeholder="New todo here"/>
			<input type="checkbox"
				v-if="todos.length"
				class="toggle-all"
				v-model="allDone"/>
			<ul v-if="todos.length">
				<TodoListItem
					v-for="todo in filteredTodos"
					:key="todo.id"
					:todo="todo"
					@remove="removeTodo"
					@toggle="toggleTodo">
				</TodoListItem>
			</ul>
			<TodoTabs	v-if="remaining || todos.length"
				@toggleFilter="toggleFilter"
				@clearCompleted="clearCompletedTodo"
				:remaining="remaining"/>
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