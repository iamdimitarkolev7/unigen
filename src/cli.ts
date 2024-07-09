#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { generateTestSample } from './utils/testSamplerGenerator'

const args = process.argv.slice(2)
const className = args[0]
const fileName = `${className}.ts`
const filePath = findFileRecursively(process.cwd(), fileName)

if (args.length !== 1 || (filePath && !fs.existsSync(filePath))) {
  console.error('Please provide a valid file name!')
  process.exit(1)
}

const content = fs.readFileSync(fileName, 'utf8')

try {
  const result = generateTestSample(content)

  const testFolder = path.join(process.cwd(), '__tests__')
  const testFileName = `${className}.spec.ts`
  let testFilePath = path.join(process.cwd(), testFileName)

  if (!fs.existsSync(testFolder)) {
    fs.mkdirSync(testFolder)
    testFilePath = path.join(testFolder, testFileName)
  } else {
    testFilePath = path.join(testFolder, testFileName)
  }

  fs.writeFileSync(testFilePath, result, 'utf8')
  console.log(`Test file created: ${testFilePath}`)
} catch (e: any) {
  console.error(e.message)
  process.exit(1)
}

function findFileRecursively(dir: string, filename: string): string | null {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      const result = findFileRecursively(fullPath, filename);
      if (result) return result;
    } else if (file === filename) {
      return fullPath;
    }
  }

  return null;
}
