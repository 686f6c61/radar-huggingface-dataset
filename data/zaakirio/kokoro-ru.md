# zaakirio/kokoro-ru

## Resumen

kokoro-ru es un modelo de síntesis de voz (text-to-speech) en ruso, desarrollado por zaakirio como una adaptación del modelo Kokoro-82M de hexgrad. Con solo 82 millones de parámetros, ofrece una velocidad de inferencia 9,8 veces superior al tiempo real en CPU de portátil, sin necesidad de GPU, lo que lo convierte en una opción atractiva para despliegues locales y aplicaciones en dispositivos con recursos limitados. El modelo incluye tres voces fijas (dos femeninas y una masculina) grabadas por actores profesionales con consentimiento, y su frontend lingüístico resuelve el estrés léxico ruso, las homógrafas y la reducción vocálica mediante el integrador RUAccent.

El modelo se basa en la arquitectura StyleTTS2 y se entrenó sobre un corpus de 29,28 horas de audio de 16 hablantes, con un coste total de entrenamiento de unos 16 dólares en una GPU RTX A6000. Publicado bajo licencia OpenRAIL, permite uso comercial y modificación, aunque el código asociado es Apache-2.0. Su relevancia actual radica en ofrecer una alternativa ligera y de alta calidad a los sistemas TTS locales existentes para ruso, como Piper, con una tasa de error de palabra (WER) media inferior.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (adaptación de Kokoro-82M) |
| Parametros totales | 81,81 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin contexto textual fijo) |
| Tipos de cuantizacion | no disponible (se distribuye en formato PyTorch .pth) |
| Idiomas soportados | ruso (ru) |
| Licencia | OpenRAIL (pesos), Apache-2.0 (código) |
| Formato de pesos | PyTorch .pth (dos checkpoints: kokoro-ru-v2-base.pth y kokoro-ru-v2-dima.pth) |

## Arquitectura y entrenamiento

kokoro-ru es un port ruso de Kokoro-82M, que a su vez sigue la receta de entrenamiento de StyleTTS2. El modelo es un decodificador de audio basado en transformadores, con un frontend fonético que convierte texto ruso en IPA, resolviendo estrés léxico, homógrafas y la regla -ого/-его mediante RUAccent. El entrenamiento se realizó en dos etapas: una primera de 5 épocas con pérdida mel de validación 0,230, y una segunda de 10 épocas con pérdida mel 0,318, sobre un corpus de 29,28 horas de audio de 16 hablantes (53% femeninos, 47% de banda completa). El hardware utilizado fue una única RTX A6000, con un coste total estimado de 16 dólares. Las voces provienen del corpus Dialogs (actores de estudio con consentimiento, bajo OpenRAIL), mientras que Russian LibriSpeech contribuyó a la cobertura fonética del modelo base pero no aporta ninguna voz distribuida.

## Capacidades

- Síntesis de voz en ruso con tres voces fijas: sveta (femenina, principal), masha (femenina) y dima (masculina).
- Resolución de estrés léxico y homógrafas mediante el frontend ru_g2p.py (integra RUAccent), con una precisión de 15/16 en pruebas de ortoepía.
- Reducción vocálica rusa y fonemización automática a IPA.
- Inferencia en CPU sin GPU, con un factor de tiempo real (RTF) de 0,102 (9,8x más rápido que tiempo real) y un pico de RAM de 2,39 GB.
- Salida de audio a 24 kHz en formato WAV.
- No soporta control de prosodia ni selección de estilo: la prosodia es determinista, dependiente de la longitud de la cadena de fonemas.

## Casos de uso

- Audiolibros y narración: el modelo puede generar voz en off para textos largos en ruso con una calidad de inteligibilidad alta (WER 2,50% en pruebas round-trip), siendo adecuado para producción de contenido audiovisual en local.
- Asistencia por voz en aplicaciones de escritorio o móviles: al ejecutarse en CPU con bajo consumo de RAM, se integra en asistentes personales, lectores de pantalla o sistemas de navegación sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: su baja latencia y funcionamiento sin conexión permiten implementar lectores de texto en dispositivos embebidos o portátiles.
- Doblaje y locución para vídeos o presentaciones: las tres voces fijas de actores profesionales ofrecen un timbre natural, aunque con limitaciones en brillo espectral (especialmente la voz sveta, más oscura).
- Educación y aprendizaje de idiomas: el frontend con resolución de estrés y homógrafas facilita la generación de ejemplos de pronunciación correcta para estudiantes de ruso.
- Prototipado rápido de sistemas TTS: al ser un modelo ligero y con API Python sencilla (paquete `kokoro` sin modificaciones), es útil para evaluar la viabilidad de TTS ruso en entornos de investigación o desarrollo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor proporciona una evaluación comparativa frente a Piper, el TTS local ruso más extendido, usando Whisper large-v3 como ASR en un conjunto de 79 palabras:

| Modelo | WER medio (%) |
|---|---|
| kokoro-ru (promedio de voces) | 2,50 |
| Piper (promedio de voces) | 4,38 |
| Piper voz irina | 0,00 (transcripción perfecta) |

Además, en pruebas de estrés y ortoepía (homógrafas, restauración de ё, regla -ого/-его, grupos consonánticos silenciosos), el frontend logró 15/16 aciertos. El autor advierte que estas diferencias son de una o dos palabras sobre el conjunto de 79, y que la métrica ASR mide inteligibilidad, no naturalidad. No se publican otros benchmarks (naturalidad MOS, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: RTF 0,102 (9,8x tiempo real) en un portátil, pico de RAM 2,39 GB. No requiere GPU.
- GPU recomendada: no necesaria; aunque puede ejecutarse en GPU, el modelo está diseñado para despliegue en CPU.
- Compatible con hardware de consumo: sí, cualquier portátil o mini-PC con al menos 3 GB de RAM libre.
- Opciones de despliegue: paquete Python `kokoro` (sin modificaciones), con carga de pesos mediante Hugging Face Hub. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a TTS).
- Latencia y throughput: a 24 kHz de salida, genera audio 9,8 veces más rápido que tiempo real en CPU; para una frase de 10 segundos, el tiempo de generación sería de aproximadamente 1 segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Velocidad | WER (ru) |
|---|---|---|---|---|---|
| kokoro-ru (zaakirio) | 81,81 M | ruso | OpenRAIL | 9,8x realtime CPU | 2,50% |
| Piper (rhasspy) | ~100 M (por voz) | multilingüe (incl. ruso) | MIT | variable, CPU | 4,38% (promedio) |
| Kokoro-82M (hexgrad) | 82 M | inglés (y otros) | OpenRAIL | similar | no aplicable (ru no soportado) |

kokoro-ru supera a Piper en inteligibilidad media (WER 2,50% vs 4,38%), aunque Piper ofrece más voces y un modelo más maduro. Kokoro-82M original no soporta ruso, por lo que esta adaptación cubre un hueco específico. No se dispone de comparación con otros TTS rusos comerciales o de código abierto (p. ej., Silero TTS) en la información proporcionada.

## Limitaciones y advertencias

- Timbre más oscuro que las grabaciones originales, especialmente en la voz sveta (-33,8 dB en banda 6-10 kHz frente a Piper irina), lo que puede percibirse como menos brillante o natural en algunos contextos.
- Artefacto fricativo en las consonantes ж/ш/х: presentan crestas espectrales estrechas en lugar de ruido plano, a unos 31 dB por debajo del nivel de programa; audible solo a volúmenes altos.
- Precisión en homógrafas del 93,8%: hay fallos conocidos (p. ej., "мука" se pronuncia como harina en lugar de tormento). Para textos críticos se recomienda pasar estrés explícito.
- Prosodia determinista: el vector de estilo se elige según la longitud de la cadena de fonemas, por lo que el mismo texto siempre produce exactamente el mismo audio; no hay control de entonación ni variación.
- Limitación de voces: solo tres voces fijas, sin posibilidad de clonar o crear nuevas voces con los pesos distribuidos.
- El conjunto de evaluación es pequeño (79 palabras), por lo que las métricas de WER pueden no generalizar a textos largos o complejos.
- Licencia OpenRAIL para los pesos: permite uso comercial, pero puede imponer restricciones de uso (p. ej., no generar contenido engañoso o ilegal). El código (ru_g2p.py) es Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaakirio/kokoro-ru
- Repositorio de archivos: https://huggingface.co/zaakirio/kokoro-ru/tree/main
- Discusiones del modelo: https://huggingface.co/zaakirio/kokoro-ru/discussions
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio de Kokoro (GitHub): https://github.com/hexgrad/kokoro
- RUAccent (frontend de estrés): https://github.com/Den4ikAI/ruaccent
