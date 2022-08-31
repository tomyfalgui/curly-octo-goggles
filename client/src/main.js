import { faker } from '@faker-js/faker'

document.querySelectorAll('img').forEach(node => {
  node.src = faker.image.avatar()
})
