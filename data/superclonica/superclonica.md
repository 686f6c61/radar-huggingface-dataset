# Superclonica/superclonica

## Resumen

SuperClonica es un motor de síntesis de voz (text-to-speech) que ejecuta el modelo Supertonic 3 de Supertone sin modificar sus pesos: mismos 99 millones de parámetros, mismas voces y mismas semillas, pero con un pipeline de inferencia y postprocesado reescrito. Lo desarrolla Superclonica y se distribuye como paquete Python (`superclonica-cpu` / `superclonica-gpu-cuda`) y como imagen Docker, con los pesos en formato ONNX (unos 400 MB que se descargan en la primera ejecución). Funciona totalmente offline en CPU (Windows, macOS, Linux) o en GPU NVIDIA (Windows y Linux x86-64).

El problema que aborda no es la calidad de la voz, sino los defectos de producción alrededor de ella: silencios largos antes y después de cada frase, ruido de fondo en las pausas, finales de frase cortados, números mal leídos y latencia alta en CPU. Según las mediciones del autor, el motor arranca la voz a los 0,08 s (frente a 0,50 s), es entre 1,6 y 1,7 veces más rápido en CPU y GPU, y reduce los cortes abruptos de frase del 17,7 % al 2,0 % en inglés y del 11,9 % al 1,0 % en ruso.

Es relevante ahora porque cubre 31 idiomas con licencia Apache-2.0 y salida WAV mono a 44,1 kHz, sin depender de servicios en la nube, y porque acepta cualquier fichero JSON de estilo de voz de Supertonic 3 (`style_ttl` + `style_dp`), incluidos los M1–M5 y F1–F5 de Supertone y las más de 170 voces de su catálogo. Es, en la práctica, una capa de optimización de inferencia sobre un modelo TTS pequeño y abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; es el modelo TTS Supertonic 3 (Supertone) exportado a ONNX y ejecutado con ONNX Runtime |
| Parametros totales | ~99 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a TTS; el texto se divide en fragmentos de hasta 160 caracteres (300 en Supertonic 3 original) |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas de los pesos ONNX |
| Idiomas soportados | 31: en, ru, de, fr, es, pt, it, nl, pl, uk, cs, sk, sl, hr, bg, ro, hu, el, tr, ar, hi, id, vi, ja, ko, sv, da, fi, et, lv, lt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (~400 MB) |
| Frecuencia de muestreo de salida | 44,1 kHz, mono, WAV |
| Voces | cualquier fichero JSON de estilo de Supertonic 3 (`style_ttl` + `style_dp`); M1–M5 y F1–F5 de Supertone; 170+ voces en el catálogo del autor |
| Runtime | ONNX Runtime (CPU multihilo o CUDA graphs en GPU); probado con ONNX Runtime GPU 1.26 |
| Requisitos de Python | 3.10+ (CPU), 3.11+ (GPU NVIDIA) |

## Arquitectura y entrenamiento

No se aporta información sobre la arquitectura interna de Supertonic 3 (tipo de red, mecanismo de atención, esquema de difusión o flow matching, composición del dataset o número de tokens de entrenamiento): la model card describe únicamente la capa de ejecución. Lo que sí se documenta es que los pesos no se han modificado ni reentrenado, y que SuperClonica no aplica fine-tuning: se limita a reescribir los modelos ONNX para cómputo multihilo en CPU y a ejecutar el grafo completo como CUDA graphs en GPU.

Las innovaciones declaradas son de inferencia y postprocesado. En GPU, todo el modelo se ejecuta como CUDA graphs grabados; en CPU, los modelos se reescriben para cálculo multihilo. El texto se trocea en fragmentos de hasta 160 caracteres cortando en pausas naturales, los números se expanden a palabras en 27 idiomas (desactivable con `numbers=False`), se aplica una limpieza de la salida verificada contra la salida cruda con un reconocedor de fonemas (más de 25.000 generaciones en más de 30 idiomas sin cortes confirmados de habla real) y se usa un limitador con look-ahead que solo atenúa los picos por encima de escala completa para evitar clipping. Parámetros de referencia de las mediciones: velocidad 1.05 y 8 pasos de inferencia.

## Capacidades

- Síntesis de voz a partir de texto en 31 idiomas, con salida WAV mono a 44,1 kHz.
- Reutilización exacta de voces de Supertonic 3: cualquier JSON de estilo (`style_ttl` + `style_dp`), con la misma voz e intención que el modelo original.
- Reproducibilidad por semilla (`seed`), útil para regenerar un mismo audio de forma determinista.
- Expansión de números a palabras en 27 idiomas, con modo heredado del modelo original disponible.
- Troceado inteligente del texto en pausas naturales (fragmentos de hasta 160 caracteres) para reducir tropiezos en textos largos.
- Limpieza de pausas y finales de frase: reduce el ruido de fondo en silencios a −92 dB y los cortes abruptos a porcentajes del 0–2 %.
- Ejecución totalmente offline, sin llamadas a servicios externos.
- Tres modos de uso: biblioteca Python (`Superclonica().synthesize(...)`), interfaz de línea de comandos (`superclonica --text ... --voice ... --lang ... --output ...`) y servidor HTTP en Docker (CPU o CUDA).
- Inferencia en CPU sin GPU y en GPU NVIDIA con CUDA graphs.
- No se documentan en la información disponible capacidades de clonación de voz a partir de audio, emoción explícita, streaming incremental, diarización ni procesamiento de audio de entrada.

## Casos de uso

- Lectura automatizada de artículos y documentación: el motor trocea el texto en fragmentos de hasta 160 caracteres cortando en pausas naturales, lo que evita los tropiezos típicos en párrafos largos y permite generar audio por lotes con una voz fija y una semilla reproducible.
- Asistentes de voz y kioscos offline: al funcionar sin conexión en CPU y arrancar la voz a 0,08 s de mediana, encaja en terminales de atención al público, tótems o dispositivos industriales donde no se puede depender de la nube ni de una GPU.
- Localización y doblaje a 31 idiomas: un mismo pipeline puede generar pistas de voz en inglés, ruso, alemán, francés, español, portugués, italiano, neerlandés, polaco, ucraniano, checo, eslovaco, esloveno, croata, búlgaro, rumano, húngaro, griego, turco, árabe, hindi, indonesio, vietnamita, japonés, coreano, sueco, danés, finés, estonio, letón y lituano sin cambiar de modelo.
- Accesibilidad y lectores de pantalla: la combinación de baja latencia en CPU, salida a 44,1 kHz y limpieza de pausas hace que la lectura continuada no acumule silencios de medio segundo ni ruido de fondo entre frases.
- Contestador y mensajería telefónica pregrabada: la reducción del silencio inicial (0,50 s → 0,08 s) y final (0,63 s → 0,20 s) y la eliminación de clics y respiraciones tras la última palabra simplifican el recorte y la integración en centralitas.
- Generación de audio para vídeo, pódcast y e-learning: el limitador con look-ahead evita el clipping en los picos, de modo que la señal se puede integrar en una mezcla sin normalización agresiva posterior.
- Pre-generación por lotes en pipelines de CI/CD: el paquete Python y la imagen Docker permiten empaquetar la síntesis como un paso más del pipeline, con la semilla fijada para que los audios de una misma versión del contenido sean idénticos entre ejecuciones.
- Prototipado de voces en productos: cualquier JSON de estilo compatible se puede cargar directamente, lo que permite cambiar de voz sin reentrenar ni reinstalar el motor.

## Benchmarks y rendimiento

No se han publicado métricas estándar de TTS (MOS, WER/CER, similitud de hablante) ni benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible; no aplican a un modelo de síntesis de voz. Los datos publicados son mediciones de latencia y de calidad de señal del propio autor, comparando Supertonic 3 "stock" (versión 1.3.1) con SuperClonica 0.6.23, con la misma voz, texto y semilla por frase, velocidad 1.05 y 8 pasos.

| Metrica | Supertonic 3 (stock) | SuperClonica |
|---|---:|---:|
| GPU (RTX 5070 Ti), mediana por frase | 202 ms | 117 ms |
| GPU, 10 frases seguidas | 2,03 s | 1,19 s |
| CPU (Ryzen 7 5800X, 4 hilos), mediana por frase | 855 ms | 530 ms |
| CPU, 24 frases en 8 idiomas | 22,03 s | 14,39 s |
| Silencio antes de la primera palabra (mediana, 10 frases) | 0,50 s | 0,08 s |
| Silencio después de la última palabra (mediana) | 0,63 s | 0,20 s |
| Ruido de fondo en pausas (relativo al pico) | −48 dB | −92 dB |
| Frases con corte abrupto al final, ruso (312 clips) | 11,9 % | 1,0 % |
| Frases con corte abrupto al final, inglés (300 clips) | 17,7 % | 2,0 % |
| Frases con corte abrupto al final, alemán (132 clips) | 10,6 % | 0,0 % |

Otras mediciones declaradas: entre 26 y 27 sonidos parásitos tras la última palabra en tandas de 1.392 y 1.800 frases con la salida original, frente a 0 y 3 tras la limpieza; más de 25.000 generaciones en más de 30 idiomas verificadas con reconocedor de fonemas sin cortes confirmados de habla real; y tiempo de arranque de 9,5 s frente a 1,2 s en GPU y de 4,0 s frente a 0,9 s en CPU (penalización asumida por la preparación de los CUDA graphs y de los modelos optimizados).

## Requisitos de hardware

- VRAM: no se publica una cifra concreta. Los pesos ocupan unos 400 MB, por lo que el modelo cabe con holgura en cualquier GPU consumer; el consumo real de memoria depende del runtime ONNX y del tamaño de los CUDA graphs, que no se documenta.
- CPU: cualquier x86-64 o Apple Silicon con Python 3.10+; el autor reporta 530 ms de mediana por frase en un Ryzen 7 5800X con 4 hilos. Funciona en Windows, macOS y Linux.
- GPU: NVIDIA con CUDA, solo en Windows y Linux x86-64 (Python 3.11+); el paquete `superclonica-gpu-cuda` instala CUDA y cuDNN. Referencia medida: RTX 5070 Ti, 117 ms de mediana por frase. No se documenta soporte de GPU en macOS.
- Cabe en GPU consumer: sí, por tamaño de pesos; no se especifica el mínimo de VRAM ni el soporte de GPUs sin tensor cores o de generaciones antiguas.
- Despliegue: paquete Python (`pip install superclonica-cpu` o `superclonica-gpu-cuda`), CLI y servidor HTTP en Docker (`superclonica/superclonica:cpu` y `:cuda`). No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Throughput y latencia: 117 ms por frase en GPU y 530 ms en CPU (4 hilos) como medianas; 1,19 s para 10 frases en GPU y 14,39 s para 24 frases en 8 idiomas en CPU. El arranque añade 9,5 s en GPU y 4,0 s en CPU, por lo que se recomienda crear el motor una sola vez y mantenerlo vivo.
- Almacenamiento: unos 400 MB de pesos, descargados en la primera ejecución; la imagen Docker puede montar un volumen (`/models`) para cachearlos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Ejecucion | Notas |
|---|---|---|---|---|---|
| SuperClonica | ~99 M | 31 | Apache-2.0 | CPU y GPU NVIDIA, ONNX, offline | Capa de inferencia y postprocesado sobre Supertonic 3; mismas voces y semillas |
| Supertonic 3 (stock) | ~99 M | 31 | Apache-2.0 | CPU y GPU, ONNX, offline | Misma calidad de voz; más lento (202 ms GPU / 855 ms CPU por frase), más silencio inicial y final, más cortes y ruido en pausas |
| Piper | no disponible en la informacion proporcionada | no disponible | no disponible | CPU | Referencia habitual de TTS ligero offline; datos no verificados en esta busqueda |
| Kokoro-82M | no disponible en la informacion proporcionada | no disponible | no disponible | CPU y GPU | Alternativa de tamano similar muy usada en TTS abierto; datos no verificados en esta busqueda |
| XTTS-v2 (Coqui) | no disponible en la informacion proporcionada | no disponible | no disponible | CPU y GPU | Enfocado a clonación de voz con audio de referencia; licencia y prestaciones no verificadas en esta busqueda |

Solo la comparación con Supertonic 3 procede de la información proporcionada por el autor. Los datos de Piper, Kokoro-82M y XTTS-v2 no están verificados en esta ficha y deben confirmarse en sus respectivas model cards antes de tomar una decisión.

## Limitaciones y advertencias

- El repositorio no aporta métricas subjetivas de calidad (MOS) ni de inteligibilidad (WER/CER); las cifras de mejora son mediciones del propio autor, sin comparación independiente.
- Arranque más lento que el modelo original: 9,5 s frente a 1,2 s en GPU y 4,0 s frente a 0,9 s en CPU. Un uso de una sola frase por proceso penaliza más que el modelo stock.
- En GPU, los párrafos largos pueden salir ligeramente más lentos por el troceado a 160 caracteres; el autor indica que no lo observó en sus mediciones, pero lo reconoce como posible.
- Los números se leen sin caso gramatical: los ordinales rusos y los años en inglés se pronuncian como números planos. Para conservar el comportamiento original hay que usar `numbers=False`.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: no hay evidencia de adopción ni de validación por terceros.
- No se documenta el comportamiento en idiomas de bajos recursos dentro de los 31 soportados, ni la variación de calidad entre ellos; las pruebas de cortes se centran en ruso, inglés y alemán.
- Las voces son ficheros JSON externos: la licencia Apache-2.0 cubre el motor, pero los derechos de uso de cada voz del catálogo (incluidas las del marketplace de 170+ voces) deben verificarse por separado.
- Soporte de GPU limitado a Windows y Linux x86-64; no se documenta aceleración por GPU en macOS ni en ARM.
- No se documentan funciones de clonación de voz, control de emoción, streaming ni marcas de agua o identificación de audio sintético, relevantes para cumplimiento normativo en la UE.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de errores de pronunciación y de expansión incorrecta de números, siglas y unidades en según qué idioma.
- Al ser una capa sobre Supertonic 3, hereda cualquier sesgo o limitación del modelo base; no se publican análisis de sesgo lingüístico o de género de las voces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Superclonica/superclonica
- Modelo base Supertonic 3: https://huggingface.co/Supertone/supertonic-3
- Demo online con voces gratuitas: https://huggingface.co/spaces/Superclonica/superclonica-tts
- Voces gratuitas en GitHub: https://github.com/superclonica/supertonic-voices
- Voz de ejemplo `ciri.json`: https://github.com/superclonica/supertonic-voices/raw/main/voices/ciri/ciri.json
- Catálogo de más de 170 voces: https://superclonica.com/en/explore
- Comparativa con grabaciones Supertonic vs SuperClonica: https://superclonica.com/en/compare/supertonic
- Imagen Docker: https://hub.docker.com/r/superclonica/superclonica
