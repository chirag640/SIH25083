import { SecureCrypto } from '../lib/crypto'

async function run() {
  try {
    const res = await SecureCrypto.hashPassword('password123')
    console.log('Hash result:', res)
  } catch (err) {
    console.error('Error running test:', err)
  }
}

run()
