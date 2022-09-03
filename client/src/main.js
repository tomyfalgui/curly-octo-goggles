import { faker } from '@faker-js/faker'

import { generateResponseNode } from './lib.js'
export const BACKEND = 'http://localhost:4444'

document.querySelectorAll('img').forEach(node => {
  node.src = faker.image.avatar()
})

async function fetchResponses() {
  return await fetch(`${BACKEND}/comments`).then(resp => resp.json())
}
function displayComments(comments) {
  const commentsParent = document.querySelector('.responses')
  commentsParent.innerHTML = ''
  comments.reverse().forEach(comment => {
    const responseContainer = generateResponseNode(comment)
    commentsParent.appendChild(responseContainer)
  })
}

function handleCommentSubmission() {
  const form = document.querySelector('form')
  const input = document.querySelector('input[type="text"]')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value.trim() == '') {
      return
    }

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
      })
      .catch(err => {
        console.error(err)
      })
  })
}

async function main() {
  const responses = await fetchResponses()

  displayComments(responses.comments)
  handleCommentSubmission()
}

main().catch(err => console.error(err))
