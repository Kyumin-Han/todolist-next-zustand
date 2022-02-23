import type { NextPage } from 'next'
import { FormEvent, useCallback, useState } from 'react'
import { TodoItem, useStore } from './store'

const Home: NextPage = () => {
  return (
    <div className="App">
      <div className="navbar bg-white">
        <a className="btn btn-ghost normal-case text-xl text-black">TODOLIST</a>
      </div>
      <TodoList />
    </div>
  )
}

function TodoList() {
  const [newText, setNewText] = useState('')
  const {
    hideCompleted,
    toggleHideCompleted,
    addItem,
    removeCompleted,
    items,
  } = useStore()

  function addTodoItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    addItem({ id: Date.now(), title: newText, done: false })
    setNewText('')
  }

  const addTodoItem2 = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      addItem({ id: Date.now(), title: newText, done: false })
      setNewText('')
    },
    [newText]
  )

  return (
    <>
      <form onSubmit={addTodoItem} className="mt-5 flex gap-4">
        <label className="input-group input-group-sm">
          <span>할 일</span>
          <input
            type="text"
            placeholder="할 일을 입력하세요."
            className="input input-bordered input-sm"
            value={newText}
            onChange={e => setNewText(e.currentTarget.value)}
          />
        </label>

        {/* <input
          type="text"
          placeholder="New Todo"
          value={newText}
          onInput={e => setnewText(e.currentTarget.value)}
        /> */}
        <button
          type="submit"
          className="btn btn-sm btn-outline ml-1"
          disabled={!newText.trim()}
        >
          할 일 저장하기
        </button>
      </form>
      <label className="cursor-pointer label">
        Hide completed
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={toggleHideCompleted}
          className="checkbox"
        />
      </label>
      {/* <input
        type="checkbox"
        checked={hideCompleted}
        onChange={toggleHideCompleted}
      />
      Hide completed */}
      <List></List>
    </>
  )
}

function List() {
  const { hideCompleted, items } = useStore()
  return (
    <ul>
      {items
        .filter(li => !li.done || !hideCompleted)
        .map(li => (
          <ListItem item={li} key={li.id}></ListItem>
        ))}
    </ul>
  )
}

function ListItem({ item }: { item: TodoItem }) {
  const { toggleItem, removeItem } = useStore()
  return (
    <li className={item.done ? 'done' : ''}>
      <input
        type="checkbox"
        name=""
        id=""
        checked={item.done}
        onChange={() => toggleItem(item)}
      />{' '}
      {item.title}{' '}
      <button onClick={() => removeItem(item)} className="delete">
        delete
      </button>
    </li>
  )
}

export default Home
