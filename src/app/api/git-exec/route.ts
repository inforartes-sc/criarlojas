import { execSync } from 'child_process'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const outputs: string[] = []

    // 1. Stage changes
    const addOut = execSync('git add .', { cwd: process.cwd() }).toString()
    outputs.push(`git add: ${addOut || 'success'}`)

    // 2. Commit changes
    const commitOut = execSync('git commit -m "feat: show/hide price for services and multi-service invoice creation"', { cwd: process.cwd() }).toString()
    outputs.push(`git commit: ${commitOut}`)

    // 3. Push to GitHub
    const pushOut = execSync('git push origin main', { cwd: process.cwd() }).toString()
    outputs.push(`git push: ${pushOut || 'success'}`)

    return NextResponse.json({ success: true, logs: outputs })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stderr: error.stderr?.toString(),
      stdout: error.stdout?.toString()
    }, { status: 500 })
  }
}
