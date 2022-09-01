import { faker } from '@faker-js/faker'

const BACKEND = 'http://localhost:4444'

document.querySelectorAll('img').forEach(node => {
  node.src = faker.image.avatar()
})

async function fetchResponses() {
  return await fetch(`${BACKEND}/comments`).then(resp => resp.json())
}

//https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
function convertToTimeAgo(dateString) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const convertedDate = new Date(dateString).getTime()

  const differenceDate = new Date().getTime() - convertedDate

  let val = 1
  let unit = ''

  if (differenceDate < msPerMinute) {
    val = Math.round(differenceDate / 1000)
    unit = 'second'
  } else if (differenceDate < msPerHour) {
    val = Math.round(differenceDate / msPerMinute)
    unit = 'minute'
  } else if (differenceDate < msPerDay) {
    val = Math.round(differenceDate / msPerHour)
    unit = 'hour'
  } else if (differenceDate < msPerMonth) {
    val = Math.round(differenceDate / msPerDay)
    unit = 'day'
  } else if (differenceDate < msPerYear) {
    val = Math.round(differenceDate / msPerMonth)
    unit = 'month'
  } else {
    val = Math.round(differenceDate / msPerYear)
    unit = 'year'
  }

  return `${val} ${val > 1 ? `${unit}s` : unit} ago`
}

function displayComments(comments) {
  const commentsParent = document.querySelector('.responses')
  comments.forEach(comment => {
    const responseContainer = document.createElement('div')
    const avatar = document.createElement('img')
    const header = document.createElement('div')
    const contentBlock = document.createElement('div')
    const name = document.createElement('span')
    const time = document.createElement('span')
    const content = document.createElement('p')
    const actions = document.createElement('div')
    const upvote = document.createElement('button')

    avatar.src = faker.image.avatar()

    name.innerText = comment.name
    time.innerText = convertToTimeAgo(comment.created_at)

    header.appendChild(name)
    header.appendChild(time)

    content.innerText = comment.content

    actions.appendChild(upvote)

    contentBlock.appendChild(header)
    contentBlock.appendChild(content)
    contentBlock.appendChild(actions)

    responseContainer.classList.add('response')
    responseContainer.appendChild(avatar)
    responseContainer.appendChild(contentBlock)
    commentsParent.appendChild(responseContainer)
  })
}

function handleCommentSubmission() {
  const form = document.querySelector('form')
  const input = document.querySelector('input[type="text"]')
  const submit = document.querySelector('button[type="submit"]')

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    if (input.value.trim() == '') {
      return
    }

    console.log(input.value)
    input.value = ''
  })
}

async function main() {
  const responses = await fetchResponses()

  displayComments(responses.comments)
  handleCommentSubmission()
}

main().catch(err => console.error(err))
