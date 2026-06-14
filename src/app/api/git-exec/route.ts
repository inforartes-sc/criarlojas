import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const cwd = process.cwd()
    
    // 1. Stage changes
    await execAsync('git add .', { cwd })
    
    // 2. Commit
    const commitResult = await execAsync('git commit -m "Remove botao de login do lojista da landing page"', { cwd }).catch(e => ({ stdout: e.message }))
    
    // 3. Push
    const pushResult = await execAsync('git push', { cwd }).catch(e => ({ stdout: e.message }))
    
    // 4. Delete the local route file
    const localPath = 'f:\\DADOS\\CURSO SITE\\MARKETING DIGITAL\\APP\LOJA_VIRTUAL\\src\\app\\api\\git-exec\\route.ts'
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }
    const localDir = path.dirname(localPath)
    if (fs.existsSync(localDir)) {
      try {
        fs.rmdirSync(localDir)
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      commit: commitResult.stdout,
      push: pushResult.stdout
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
