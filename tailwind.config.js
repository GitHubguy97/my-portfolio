/** @type {import('tailwindcss').Config} */
export default {
content: [
'./index.html',
'./src/**/*.{js,jsx}',
],
theme: {
extend: {
boxShadow: {
card: '0 10px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
},
},
},
plugins: [],
}