export function distribuirPorPct(totalPausaMin, horas, ini, refrigMin, refrigOffset) {
  if (totalPausaMin <= 0) return [];
  const durIdeal = Math.min(15, Math.max(5, Math.round(totalPausaMin / Math.ceil(totalPausaMin / 10))));
  const num = Math.max(1, Math.round(totalPausaMin / durIdeal));
  return distribuirNPausas(num, durIdeal, horas, ini, refrigMin, refrigOffset);
}

export function distribuirNPausas(num, durMin, horas, ini, refrigMin, refrigOffset) {
  const totalMin = horas * 60;
  const refrigAt = refrigOffset !== undefined ? refrigOffset : Math.floor(totalMin / 2);
  const availBefore = refrigAt;
  const availAfter = totalMin - (refrigAt + refrigMin);
  const numBefore = Math.round(num * availBefore / totalMin);
  const numAfter = num - numBefore;
  const resultado = [];
  if (numBefore > 0) {
    const step = Math.floor(availBefore / (numBefore + 1));
    for (let i = 1; i <= numBefore; i++) {
      const at = Math.max(10, i * step);
      resultado.push({ at, dur: durMin, tipo: 'pausa' });
    }
  }
  if (numAfter > 0) {
    const startAfter = refrigAt + refrigMin;
    const step = Math.floor(availAfter / (numAfter + 1));
    for (let i = 1; i <= numAfter; i++) {
      const at = Math.max(startAfter + 10, startAfter + i * step);
      resultado.push({ at, dur: durMin, tipo: 'pausa' });
    }
  }
  return resultado.sort((a, b) => a.at - b.at);
}

export function distribuirCadaX(intervaloMin, durMin, horas, ini, refrigMin, refrigOffset) {
  const totalMin = horas * 60;
  const refrigAt = refrigOffset !== undefined ? refrigOffset : Math.floor(totalMin / 2);
  const resultado = [];
  let t = intervaloMin;
  while (t < totalMin - durMin) {
    if (!(t >= refrigAt - 5 && t <= refrigAt + refrigMin + 5)) {
      resultado.push({ at: t, dur: durMin, tipo: 'pausa' });
    } else {
      t = refrigAt + refrigMin;
    }
    t += intervaloMin;
  }
  return resultado;
}
