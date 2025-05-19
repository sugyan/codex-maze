import { execSync } from 'child_process'
import { existsSync } from 'fs'

try {
  execSync('npm run build', { stdio: 'inherit' })
  if (!existsSync('dist/index.html')) {
    console.error('dist/index.html not found')
    process.exit(1)
  }
} catch (err) {
  process.exit(1)
}
