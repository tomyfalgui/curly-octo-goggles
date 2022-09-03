import { faker } from '@faker-js/faker'
import { io } from 'socket.io-client'

import { generateResponseNode } from './lib.js'
export const BACKEND = 'http://localhost:4444'

document.querySelectorAll('img').forEach(node => {
  node.src = faker.image.avatar()
})

export async function fetchResponses() {
  return await fetch(`${BACKEND}/comments`).then(resp => resp.json())
}
export function displayComments(comments) {
  const socket = io(BACKEND)
  const commentsParent = document.querySelector('.responses')
  commentsParent.innerHTML = ''
  comments.reverse().forEach(comment => {
    const { responseContainer, contentBlock } = generateResponseNode(
      comment,
      true,
      socket
    )
    for (let child of comment.children.reverse()) {
      const { responseContainer: childResponse } = generateResponseNode(
        child,
        false,
        socket
      )

      contentBlock.appendChild(childResponse)
    }
    commentsParent.appendChild(responseContainer)
  })
}

function handleCommentSubmission() {
  const form = document.querySelector('form')
  const input = document.querySelector('input[type="text"]')
  let submitting = false

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value.trim() == '') {
      return
    }

    if (!submitting) {
      submitting = true
      fetch(`${BACKEND}/comments`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input.value,
          name: faker.name.fullName(),
        }),
      })
        .then(val => val.json())
        .then(async () => {
          input.value = ''
          const responses = await fetchResponses()
          displayComments(responses.comments)
          submitting = false
        })
        .catch(err => {
          console.error(err)
          submitting = false
        })
    }
  })
}

async function main() {
  const responses = await fetchResponses()

  displayComments(responses.comments)
  handleCommentSubmission()
}

main().catch(err => console.error(err))
