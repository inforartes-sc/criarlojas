import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'status'
  const message = searchParams.get('message') || 'Atualiza comparativo de planos no commercial e admin'

  try {
    const cwd = process.cwd()
    let cmd = 'git status'
    
    if (action === 'stage') {
      cmd = 'git add .'
    } else if (action === 'commit') {
      cmd = `git commit -m "${message.replace(/"/g, '\\"')}"`
    } else if (action === 'push') {
      cmd = 'git push'
    } else if (action === 'all') {
      // Run status, add, commit, and push in sequence
      const status1 = await execAsync('git status', { cwd })
      const add = await execAsync('git add .', { cwd })
      const commit = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd }).catch(err => ({ stdout: 'Nenhuma alteração pendente / ' + err.message, stderr: '' }))
      const push = await execAsync('git push', { cwd })
      return NextResponse.json({
        success: true,
        steps: {
          statusBefore: status1.stdout,
          add: add.stdout || 'staged successfully',
          commit: commit.stdout,
          push: push.stdout
        }
      })
    }

    const { stdout, stderr } = await execAsync(cmd, { cwd })
    return NextResponse.json({
      success: true,
      command: cmd,
      stdout,
      stderr
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
