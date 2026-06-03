const fs = require('fs');
const path = require('path');

const srcPath = 'F:\\DADOS\\CURSO SITE\\LOJA E SERVIÇOS\\src\\index.css';
const destPath = path.join(__dirname, '..', 'src', 'app', 'services-template.css');

console.log('Lendo CSS original...');
let css = fs.readFileSync(srcPath, 'utf8');

// Substituir seletores globais para limitar o escopo ao container .services-template
css = css.replace(/:root/g, '.services-template');
css = css.replace(/(?<!-)\bbody\b(?!-)/g, '.services-template');
css = css.replace(/(?<!-)\bhtml\b(?!-)/g, '.services-template');

// Adicionar escopo para reset global
css = css.replace(/\*\s*,\s*\*\s*::before\s*,\s*\*\s*::after/g, '.services-template, .services-template *, .services-template *::before, .services-template *::after');

// Salvar o arquivo processado
fs.writeFileSync(destPath, css, 'utf8');
console.log('CSS processado e salvo com sucesso em:', destPath);
