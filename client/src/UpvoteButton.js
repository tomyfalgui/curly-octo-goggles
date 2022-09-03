import React from 'react'
import { io } from 'socket.io-client'
import { BACKEND } from './main.js'

export default function UpvoteButton({ id, upvotes: fetchedUpvotes }) {
  const [upvotes, setUpvotes] = React.useState(+fetchedUpvotes)
  const [socket, setSocket] = React.useState()

  React.useEffect(() => {
    const socket = io(BACKEND)
    socket.on('upvote', function (receivedId) {
      if (receivedId == id) {
        setUpvotes(upvote => upvote + 1)
      }
    })
    setSocket(socket)

    return () => {
      socket.disconnect()
    }
  }, [])

  function upvoteComment() {
    fetch(`${BACKEND}/comments/${id}/upvote`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(resp => {
        if (resp.ok) {
          setUpvotes(upvote => upvote + 1)
          socket.emit('upvote', id)
          return
        }
        throw new Error('upvote failed')
      })
      .catch(() => {
        console.error('upvote failed')
      })
  }

  return (
    <button className="upvote-button" onClick={upvoteComment}>
      ▲ {upvotes} Upvote
    </button>
  )
}
