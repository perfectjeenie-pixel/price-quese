async function test() {
  const r = await fetch('http://localhost:3001/api/search?q=teddy');
  const d = await r.json();
  console.log(JSON.stringify(d.results[0], null, 2));
}

test();