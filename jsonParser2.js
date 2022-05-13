const jsonParser = input => {
  input = input.trim()
  const parsedJSON = objectParser(input) || arrayParser(input)
  if (parsedJSON && !parsedJSON[1]) return parsedJSON
  return 'fail'
}

const valueParser = input => {
  const parsedValue = arrayParser(input) || numberParser(input) || objectParser(input) || stringParser(input) || nullParser(input) || booleanParser(input)
  return parsedValue
}

const arrayParser = input => {
  if (input[0] !== '[') return null
  const output = []
  let value = input.slice(1).trim()
  if (value[0] === ']') {
    return [[], value.slice(1)]
  }
  while (value.length) {
    value = value.trim()
    const parsedItem = valueParser(value)
    if (parsedItem === null) return null
    else {
      const temp = parsedItem[1].trim()
      output.push(parsedItem[0])
      if (temp[0] === ',') {
        value = temp.slice(1)
        continue
      }
      if (temp[0] === ']') {
        return [output, temp.slice(1)]
      }
      return null
    }
  }
  return null
}

const stringParser = input => {
  if (!input.startsWith('"')) return null
  input = input.slice(1)
  let output = ''
  const escObj = {
    '"': '"',
    '/': '/',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    '\\': '\\'
  }
  while (input.length) {
    if (input[0] === '\n' || input[0] === '\t') {
      return null
    }
    if (input[0] === '\\') {
      if (input[1] === 'u') {
        const uniChars = String.fromCharCode(parseInt(input.slice(2, 6), 16))
        if (uniChars === undefined) {
          return null
        }     
        output += uniChars
        input = input.slice(6)
      } else if (escObj[input[1]]) {
        output += escObj[input[1]]
        input = input.slice(2)
      } else {
        return null
      }
    }
    if (input[0] === '"') {
      return [output, input.slice(1)]
    }
    output += input[0]
    input = input.slice(1)
  }
  return null
}

const numberParser = input => {
  const pattern = /^(-)?(0|[1-9]\d*)(\.\d+)?((e|E)(\+|-)?\d+)*/
  const found = pattern.exec(input)
  if (found === null) return null
  const len = found[0].length
  return [parseFloat(input.slice(0, len), 10), input.slice(len)]
}

const booleanParser = input => {
  if (input.startsWith('true')) return [true, input.slice(4)]
  if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}

const nullParser = input => {
  if (!input.startsWith('null')) return null
  return [null, input.slice(4)]
}

const objectParser = input => {
  if (!input.startsWith('{')) return null
  const output = {}
  input = input.slice(1).trim()
  if (input[0] === '}') {
    return [{}, input.slice(1)]
  }
  while (input.length) {
    input = input.trim()
    const key = stringParser(input)
    if (key === null) return null
    input = key[1].trim()
    if (input[0] !== ':') return null
    input = input.slice(1).trim()
    const keyValue = valueParser(input)
    if (keyValue === null) return null
    const temp = keyValue[1].trim()
    output[key[0]] = keyValue[0]
    if (temp[0] === ',') {
      input = temp.slice(1)
      continue
    }
    if (temp[0] === '}') {
      return [output, temp.slice(1)]
    }
    return null
  }
  return null
}

const fs = require('fs')
fs.readdir('./test', (err, files) => {
  if (err) console.log(err)
  else {
    files.forEach(file => {
      const jsonString = fs.readFileSync(`./test/${file}`, { encoding: 'utf-8' })
      console.log(jsonParser(jsonString))
    })
  }
})

// const fs = require('fs')
// const jsonString = fs.readFileSync('./tempjson.json', { encoding: 'utf-8' })
// console.log(jsonString)
// console.log(jsonParser(jsonString))
