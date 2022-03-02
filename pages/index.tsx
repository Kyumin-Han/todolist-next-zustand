import type { NextPage } from 'next'

import { FormEvent, useCallback, useState } from 'react'
import { TodoItem, useStore } from './store'
import { useForm } from 'react-hook-form'
import produce from 'immer'
import axios from 'axios'
import useSWR from 'swr'

const client = axios.create({
  baseURL: 'http://localhost:4444',
  withCredentials: true,
})

// client
//   .get('/todos')
//   .then(res => {
//     console.log(res.data.payload)
//   })
//   .catch(error => {
//     console.log(error)
//   })

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
  const { handleSubmit, register } = useForm()
  const {
    hideCompleted,
    toggleHideCompleted,
    addItem,
    removeCompleted,
    items,
  } = useStore()

  function addTodoItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    addItem({ id: Date.now(), content: newText, done: false })
    setNewText('')
  }

  // const addTodoItem1 = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   addItem({ id: Date.now(), title: newText, done: false })
  //   setNewText('')
  // }

  const onSubmit = useCallback(
    (data: any) => {
      // addItem({ id: Date.now(), content: newText, done: false })
      // setNewText('')
      client
        .post('/todos', { content: newText })
        .then(res => console.log(res.data.payload))
    },
    [newText]
  )

  const addTodoItem2 = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      addItem({ id: Date.now(), content: newText, done: false })
      setNewText('')
    },
    [newText]
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex gap-4">
        <label className="input-group input-group-sm">
          <span>할 일</span>
          <input
            type="text"
            placeholder="할 일을 입력하세요."
            className="input input-bordered input-sm"
            value={newText}
            {...register('newText')}
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
  const { hideCompleted } = useStore()
  const fetcher = (url: string) => client.get(url).then(res => res.data.payload)
  const { data } = useSWR<TodoItem[]>('/todos', fetcher)
  return (
    <ul>
      {data && data.map(li => <ListItem item={li} key={li.id}></ListItem>)}
    </ul>
  )
}
// .filter(li => !li.done || !hideCompleted)

function ListItem({ item }: { item: TodoItem }) {
  const { toggleItem, updateItem, removeItem } = useStore()
  const [updateText, setUpdateText] = useState(item.content)
  const [editing, setEditing] = useState(false)

  const onClickEditButton = () => {
    setEditing(true)
  }

  const onUpdate = (e: FormEvent<HTMLInputElement>) => {
    setUpdateText(e.currentTarget.value)
  }

  const onEditSubmit = (id: number) => {
    updateItem(id, updateText)
    client.put(`/todos/${id}`, { content: updateText, done: false })
    // .then(res => console.log(res.data.payload))
    setEditing(false)
  }

  return (
    <li>
      <input
        type="checkbox"
        checked={item.done}
        onChange={() =>
          client
            .put(`/todos/${item.id}`, {
              content: item.content,
              done: !item.done,
            })
            .then(res => console.log(res.data.payload))
        }
      />
      {editing ? (
        <input
          type="text"
          className="input input-bordered input-sm"
          value={updateText}
          onChange={onUpdate}
        />
      ) : (
        `${item.content}`
      )}

      {!item.done ? (
        editing ? (
          <button type="submit" onClick={() => onEditSubmit(item.id)}>
            확인
          </button>
        ) : (
          <button type="button" onClick={onClickEditButton}>
            수정
          </button>
        )
      ) : null}
      <button
        onClick={async () =>
          await client
            .delete(`/todos/${item.id}`)
            .then(res => console.log(res.data.payload))
        }
        className="delete"
      >
        delete
      </button>
    </li>
  )
}

export default Home
