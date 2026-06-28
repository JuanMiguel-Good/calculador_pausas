export function buildExerciseSteps(postura, mental, repetitivo, esConductor, peso) {
  const steps = [];

  steps.push({
    ic: 'breathe',
    name: 'Respiración profunda',
    inst: 'Inhala lentamente por la nariz (4 seg) · retén el aire (4 seg) · exhala despacio por la boca (6 seg). Repite 3 veces.',
    secs: 42,
    media: 'https://i.postimg.cc/tCgFTyD0/breathe.gif',
  });

  steps.push({
    ic: 'stretch',
    name: 'Cuello y hombros',
    inst: 'Rota suavemente la cabeza de lado a lado, 5 veces por lado. Luego lleva cada oreja hacia el hombro y mantén 5 segundos.',
    secs: 30,
    media: '/neck.gif',
  });

  if (repetitivo === 'si' || postura === '2') {
    steps.push({
      ic: 'stretch',
      name: 'Manos y muñecas',
      inst: 'Sacude las manos con suavidad 10 segundos. Luego extiende cada muñeca hacia arriba y abajo, mantén 5 segundos cada posición.',
      secs: 30,
    });
  }

  if (mental === 'si') {
    steps.push({
      ic: 'eye',
      name: 'Descanso visual',
      inst: 'Aparta la vista de la pantalla. Mira un punto a más de 6 metros de distancia. Parpadea conscientemente 20 veces. Cierra los ojos 10 segundos.',
      secs: 30,
      media: '/eyes.gif',
    });
  }

  if (esConductor) {
    steps.push({
      ic: 'back',
      name: 'Pausa de pie (conductor)',
      inst: 'Sal de la cabina. Camina al menos 2 minutos. Haz rotaciones de cadera y estira los gemelos apoyándote en el vehículo. La pausa debe ser de pie, nunca sentado.',
      secs: 120,
      media: '/driver.gif',
    });
  }

  if (parseInt(peso) >= 3 && !esConductor) {
    steps.push({
      ic: 'stretch',
      name: 'Zona lumbar',
      inst: 'De pie, coloca las manos en la cintura y arquea suavemente la espalda hacia atrás. Luego inclínate hacia adelante con rodillas levemente flexionadas. Mantén cada posición 8 segundos.',
      secs: 30,
      media: '/lumbar.gif',
    });
  }

  if (postura === '7' && !esConductor) {
    steps.push({
      ic: 'back',
      name: 'Cambio postural',
      inst: 'Si llevas más de 45 minutos en la misma posición, este es el momento de cambiarla. Camina 1 minuto o alterna entre estar de pie y sentado.',
      secs: 30,
    });
  }

  return steps;
}
