// api.js - mock service to ease future API integration
async function tryNetwork(path){
  try{
    const base = (typeof window!=='undefined' && window.STREAMFLIX_API_BASE) || '';
    if(!base) throw new Error('no-base');
    const res = await fetch(`${base.replace(/\/$/,'')}/${path.replace(/^\//,'')}`);
    if(!res.ok) throw new Error('bad-status');
    return await res.json();
  }catch(e){
    return null;
  }
}

export async function fetchCollection(kind){
  // simulate latency for mock consistency
  await new Promise(r=>setTimeout(r, 250));
  // try real API if enabled
  if(typeof window!=='undefined' && window.STREAMFLIX_USE_API){
    const data = await tryNetwork(`collections/${encodeURIComponent(kind)}`);
    if(Array.isArray(data) && data.length){
      // expected shape: {id,title,year,genre:[...],rating,poster}
      return data;
    }
  }
  const base = [
    {id:1,title:'Aube Rouge',year:2025,genre:['Sci-Fi','Action'],rating:7.8,poster:'https://picsum.photos/300/450?random=1'},
    {id:2,title:'Nuit Blanche',year:2024,genre:['Thriller'],rating:7.2,poster:'https://picsum.photos/300/450?random=2'},
    {id:3,title:'Lignes de fuite',year:2023,genre:['Drama'],rating:6.9,poster:'https://picsum.photos/300/450?random=3'},
    {id:4,title:'Zone Libre',year:2025,genre:['Action'],rating:8.1,poster:'https://picsum.photos/300/450?random=4'},
    {id:5,title:'Les Échos',year:2022,genre:['Mystery'],rating:7.0,poster:'https://picsum.photos/300/450?random=5'},
    {id:6,title:'Soleil Noir',year:2024,genre:['Horror'],rating:6.5,poster:'https://picsum.photos/300/450?random=6'}
  ];
  const more = [...base].reverse();
  switch(kind){
    case 'popular': return base.concat(more, base);
    case 'recent': return more.concat(base);
    case 'trending': return base;
    case 'similar': return base.slice(0,8);
    default: return base;
  }
}

export async function fetchMovie(id){
  await new Promise(r=>setTimeout(r, 200));
  if(typeof window!=='undefined' && window.STREAMFLIX_USE_API){
    const data = await tryNetwork(`movies/${encodeURIComponent(id)}`);
    if(data && data.id){
      return data;
    }
  }
  const n = Number(id)||1;
  return {
    id:n,
    title: n===1? 'Aube Rouge' : `Film ${n}`,
    year: 2025,
    duration: 118,
    rating: 7.8,
    genres: ['Sci-Fi','Action'],
    overview: "Dans un avenir proche, une pilote se bat pour sauver sa cité d'une menace inconnue.",
    poster: `https://picsum.photos/600/900?random=${n}`,
    director: 'L. Durand',
    cast: ['A. Martin','K. Leroy','M. Dupont'],
    language: 'FR',
    country: 'FR',
  };
}
