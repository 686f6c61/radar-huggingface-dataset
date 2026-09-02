# vaghawan/xtts-v2-stage-a-bibletts-hausa-1epoch-87h-bible_tts_speaker

## Resumen

El modelo `vaghawan/xtts-v2-stage-a-bibletts-hausa-1epoch-87h-bible_tts_speaker` es un ajuste fino (fine-tune) del sistema de síntesis de voz Coqui XTTS-v2, especializado en el idioma hausa. Desarrollado por el usuario vaghawan, este modelo se entrena sobre el corpus BibleTTS (OpenSLR SLR129), que contiene aproximadamente 40 000 clips de audio de un único hablante masculino, con un total de 87 horas de grabaciones de estudio a 48 kHz. El resultado es un modelo de text-to-speech (TTS) monolingüe, de hablante único, que hereda las capacidades de clonación de voz y síntesis natural del modelo base.

La relevancia de este modelo radica en que el hausa es una lengua con escasos recursos para TTS de alta calidad. Al aprovechar la arquitectura de XTTS-v2 (basada en un modelo de lenguaje de voz y un decodificador neuronal), se consigue una síntesis inteligible y natural para este idioma, con una única referencia de voz. El modelo se distribuye bajo la licencia pública de Coqui, que restringe el uso comercial, y está pensado para investigación y desarrollo de aplicaciones de voz en hausa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (GPT de voz + decodificador autoregresivo) |
| Parametros totales | no disponible (el modelo base XTTS-v2 tiene ~1.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa hasta 12 s de audio de referencia) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizar) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | Coqui Public Model License (otra) |
| Formato de pesos | PyTorch `.pth` (checkpoint GPT) |

## Arquitectura y entrenamiento

XTTS-v2 es un modelo de TTS de dos etapas: una primera etapa emplea un modelo de lenguaje (tipo GPT) que predice secuencias de tokens de voz a partir del texto y de un audio de referencia del hablante; la segunda etapa utiliza un decodificador neuronal (basado en HiFi-GAN) que convierte esos tokens en forma de onda. El ajuste fino se realizó en una sola época (stage A) sobre el checkpoint preentrenado de XTTS-v2, usando únicamente los datos de habla del corpus BibleTTS para hausa. No se aplicaron técnicas de alineación por refuerzo (RLHF) ni optimización por preferencias (DPO). El vocabulario BPE se extendió para incluir caracteres propios del hausa, y se añadió un parche de ejecución (`xtts_hausa_patch.py`) para manejar particularidades fonéticas del idioma.

## Capacidades

- Síntesis de voz en hausa a partir de texto, con una sola voz de referencia (hablante `bible_tts_speaker`).
- Clonación de voz: el modelo puede imitar la voz de la referencia proporcionada, aunque en este caso solo se ha entrenado con una única voz.
- Generación de audio de alta calidad (48 kHz) gracias al decodificador de XTTS-v2.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; su función es exclusivamente text-to-speech.
- No es multilingüe: está especializado únicamente en hausa, aunque el modelo base era multilingüe, este ajuste lo restringe a un solo idioma.

## Casos de uso

- Audiolibros y narración: el modelo puede leer textos largos en hausa con una voz consistente, adecuado para producir audiolibros de obras literarias o religiosas (dado el origen del dataset).
- Asistentes de voz para comunidades hausa: integrar el modelo en aplicaciones de lectura en voz alta para dispositivos móviles o web, permitiendo a usuarios con baja alfabetización acceder a contenido escrito.
- Educación y aprendizaje de idiomas: generar ejemplos de pronunciación correcta en hausa para aplicaciones de enseñanza de la lengua.
- Accesibilidad: permitir a personas con discapacidad visual escuchar contenido digital en hausa, mediante la conversión de texto a voz en tiempo real.
- Investigación en TTS para lenguas de bajos recursos: servir como punto de partida para experimentos con otros hablantes o dialectos del hausa, ampliando la cobertura del idioma.
- Producción de contenidos multimedia: doblaje de vídeos, podcasts o anuncios en hausa, siempre que se respete la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas objetivas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas TTS para hausa. Se recomienda realizar una evaluación subjetiva de naturalidad e inteligibilidad antes de su uso en aplicaciones.

## Requisitos de hardware

- El checkpoint `best_model.pth` ocupa aproximadamente 5.6 GB en disco, lo que indica una huella de memoria considerable.
- Para inferencia en GPU, se recomienda al menos 8 GB de VRAM (p. ej., NVIDIA RTX 2070, RTX 3060, T4). En CPU es posible pero con latencias altas (varios segundos por frase).
- El modelo se ejecuta con la librería Coqui TTS; se puede desplegar con el script `infer.py` incluido, o integrarse en pipelines de Coqui.
- No se han publicado mediciones de latencia o throughput específicas. En una GPU moderna (p. ej., RTX 4090) se espera una síntesis casi en tiempo real, pero no hay datos confirmados.
- Dado el tamaño, no es adecuado para dispositivos embebidos o móviles sin cuantización adicional.

## Comparativa con modelos similares

| Modelo | Idioma | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vaghawan/xtts-v2-stage-a-bibletts-hausa (este) | hausa | no disp. (base ~1.6B) | 12 s ref. | Coqui Public Model License | Hugging Face |
| coqui/XTTS-v2 (base) | 17 idiomas | ~1.6B | 12 s ref. | Coqui Public Model License | Hugging Face |
| Masakhane TTS (proyecto) | varios africanos | no disp. | no disp. | no disp. | no disponible |

No existen muchos modelos TTS específicos para hausa en abierto. El modelo base XTTS-v2 ya tenía soporte para hausa, pero este ajuste mejora la calidad para una voz concreta. Otros proyectos como Masakhane (impulsor de BibleTTS) no ofrecen modelos listos para usar en esta comparativa.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con un único hablante masculino del corpus bíblico; la voz generada será siempre la misma y con un estilo de lectura formal y pausado, inadecuado para otros registros.
- El dataset proviene de la Biblia, por lo que el vocabulario y las construcciones gramaticales pueden tener un sesgo religioso y arcaico, limitando su uso en contextos coloquiales o técnicos.
- La licencia Coqui Public Model License restringe el uso comercial; cualquier aplicación de producción debe verificar los términos exactos y las condiciones de redistribución.
- No se han evaluado sesgos de género, edad o dialecto; el modelo puede fallar con variantes regionales del hausa.
- Riesgo de alucinación fonética: en palabras poco comunes o préstamos, el modelo puede producir pronunciaciones incorrectas.
- Al ser un fine-tune de una sola época, la estabilidad en frases largas puede ser inferior a la del modelo base; se recomienda probar con textos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaghawan/xtts-v2-stage-a-bibletts-hausa-1epoch-87h-bible_tts_speaker
- Modelo base Coqui XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Sitio del proyecto BibleTTS: https://masakhane-io.github.io/bibleTTS/
- Repositorio GitHub de BibleTTS: https://github.com/masakhane-io/bibleTTS
- Dataset OpenSLR SLR129: https://www.openslr.org/129/
