import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const cwd = process.cwd()
    const add = await execAsync('git add .', { cwd }).catch(e => ({ stdout: e.message, stderr: e.message }))
    const commit = await execAsync('git commit -m "Implementa menu hamburguer responsivo para a versao mobile"', { cwd }).catch(e => ({ stdout: e.message, stderr: e.message }))
    const push = await execAsync('git push', { cwd }).catch(e => ({ stdout: e.message, stderr: e.message }))
    
    return NextResponse.json({
      success: true,
      add: add.stdout,
      commit: commit.stdout,
      push: push.stdout
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 200 })
  }
}
