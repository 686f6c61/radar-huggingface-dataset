# tryambientai/lang-id-voxlingua107-ecapa-gguf

## Resumen

`lang-id-voxlingua107-ecapa-gguf` es una conversión al formato GGUF del modelo `speechbrain/lang-id-voxlingua107-ecapa`, un identificador de idioma hablado (spoken language identification) basado en la arquitectura ECAPA-TDNN y entrenado sobre el corpus VoxLingua107. Lo publica el usuario `tryambientai` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), una biblioteca de inferencia de audio en C/C++ orientada a despliegues ligeros. El modelo base lo desarrolla el equipo de SpeechBrain (proyecto de investigación abierto, originalmente de la Universidad de Montreal y ahora mantenido por una comunidad amplia).

El modelo resuelve un problema concreto y acotado: dada una grabación de voz de 16 kHz mono, devuelve una lista de etiquetas de idioma ordenadas por probabilidad entre 107 lenguas posibles. No transcribe, no traduce y no genera texto; es un clasificador de audio puro. Su relevancia práctica está en el tamaño: 21,2 millones de parámetros y entre 27 y 85 MB según cuantización, lo que permite ejecutarlo en CPU, en un Mac con Metal o en una GPU integrada con Vulkan sin apenas coste.

La versión GGUF añade valor sobre el modelo original de SpeechBrain porque elimina la dependencia de PyTorch y SpeechBrain en producción, ofreciendo un binario C/C++ con API (`include/transcribe/langid.h`) y CLI. Es útil como etapa previa de enrutamiento en pipelines de ASR multilingüe, moderación de audio o análisis de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation - Time Delay Neural Network) |
| Parametros totales | 21.244.679 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa hasta los ultimos 30 s de audio de un clip) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | 107 idiomas (ab, af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, iw, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, war, yi, yo, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0); modelo base original en safetensors/PyTorch |

## Arquitectura y entrenamiento

ECAPA-TDNN es una evolución de x-vector y TDNN pensada originalmente para verificación de hablante. Combina capas convolucionales 1D con atención de canal (SE-Res2Block), agregación estadística con pooling atencional multi-cabecera y una capa de embedding seguida de varias capas fully connected. En esta variante de identificación de idioma, el autor del modelo base indica que se añadieron más capas fully connected ocultas tras el embedding y se entrenó con pérdida de entropía cruzada, lo que mejora la calidad de los embeddings para la tarea de clasificación de idioma.

El entrenamiento se realizó sobre VoxLingua107, un corpus de habla espontánea extraído de YouTube con aproximadamente 6.600 horas y 107 idiomas (unos 62 horas por idioma de media, con desequilibrio entre lenguas). La entrada es audio de 16 kHz mono; el pipeline de SpeechBrain normaliza la señal (resampleo y selección de canal) automáticamente. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador. La conversión a GGUF se validó contra la referencia de SpeechBrain en el commit `aa4d0f47` de transcribe.cpp el 2026-10-08.

## Capacidades

- Identificación de idioma hablado entre 107 lenguas, devolviendo etiquetas ordenadas por probabilidad.
- Restricción opcional del conjunto de candidatos mediante `--allow` (por ejemplo, `--allow en,de,fr`), útil para enrutamiento controlado.
- Salida top-k configurable (`--top N`).
- Procesa audio de hasta los últimos 30 segundos de un clip (según model card).
- Entrada: WAV mono a 16 kHz (conversión previa con `ffmpeg` si es necesario).
- API C (`include/transcribe/langid.h`) y CLI (`transcribe-cli`).
- Aceleración por CPU, Metal (Apple Silicon) y Vulkan (GPU integradas y discretas).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta timestamps (`timestamps: none`).
- No es un modelo de transcripción ni de generación de texto.

## Casos de uso

- **Enrutamiento previo en pipelines de ASR multilingüe**: antes de invocar un modelo de reconocimiento de voz, el sistema detecta el idioma del audio y selecciona el modelo o el lexicon adecuado. Con 27 MB en Q8_0 y un RTF de 122,91 en CPU (M4), el coste de esta etapa es despreciable frente a la transcripción.
- **Moderación y triaje de audio en plataformas**: clasificar automáticamente el idioma de clips subidos por usuarios para aplicar políticas por región o derivar a revisores humanos con el idioma correcto. La restricción `--allow` permite limitar a los idiomas que la plataforma soporta legalmente.
- **Análisis de contenido y catalogación de archivos**: indexar bibliotecas de audio (podcasts, entrevistas, llamadas) por idioma sin necesidad de un ASR completo, usando CPU y un binario C sin dependencias de Python.
- **Detección de idioma en centros de contacto**: identificar el idioma del cliente en los primeros segundos de la llamada y enrutar al agente o al bot adecuado. El modelo puntúa hasta los últimos 30 s del clip, suficiente para una muestra inicial.
- **Investigación en lingüística computacional y evaluación de ASR**: usar el modelo como referencia ligera para medir la cobertura multilingüe de otros sistemas o para filtrar datasets por idioma detectado.
- **Despliegue en dispositivos edge**: con 27 MB en Q8_0 y soporte de Metal/Vulkan, cabe en dispositivos con recursos limitados (Raspberry Pi, portátiles modestos, móviles vía bindings C) para tareas de accesibilidad o asistentes de voz locales.
- **Preprocesado en pipelines de subtitulado**: determinar el idioma de origen antes de aplicar traducción automática o generación de subtítulos, evitando cargar modelos de traducción innecesarios.

## Benchmarks y rendimiento

Datos publicados en la model card del autor de la conversión GGUF:

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| Top-1 accuracy FLEURS multilingual (3.000 utterances, primeros 5 s, sin recorte de silencio) | 85,23 % | 85,17 % | 86,30 % |
| Tamano del fichero | 85 MB | 45 MB | 27 MB |

Rendimiento (RTF, mayor es mejor; medido en transcribe.cpp `2fdb5c95` el 2026-10-07):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 122,91 |
| Apple M4 Max | Metal | 1.319,2 |
| AMD Ryzen 4750U | CPU | 42,16 |
| AMD Ryzen 4750U | Vulkan | 101,7 |

No se han publicado en la información disponible resultados comparativos con otros identificadores de idioma (por ejemplo, Whisper language detection o VoxLingua107 en su versión SpeechBrain nativa) más allá de la validación numérica contra la referencia de SpeechBrain, cuyos detalles están en la página del modelo en transcribe.cpp.

## Requisitos de hardware

- **VRAM/RAM estimada**: entre 27 MB (Q8_0) y 85 MB (F32) para los pesos; el consumo total del proceso es del orden de decenas a pocos cientos de MB incluyendo buffers de audio.
- **GPU recomendadas**: no requiere GPU dedicada. Funciona en CPU, en Apple Silicon con Metal y en GPU integradas o discretas con Vulkan.
- **Consumer GPU**: cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, iGPU Intel/AMD, Apple M1 en adelante). No es un modelo que aproveche GPUs de datacenter de forma significativa.
- **Opciones de despliegue**: `transcribe.cpp` (CLI y API C), compilación con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: RTF de 42,16 en CPU Ryzen 4750U y 122,91 en CPU M4 Max; con Metal en M4 Max alcanza 1.319,2 y con Vulkan en Ryzen 4750U 101,7. Un RTF de 100 implica procesar 100 segundos de audio por segundo de cómputo.
- **Requisito de entrada**: WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| `tryambientai/lang-id-voxlingua107-ecapa-gguf` (este) | 21,2 M | 107 | hasta 30 s | Apache-2.0 | GGUF | Conversion C/C++ de SpeechBrain, sin PyTorch |
| `speechbrain/lang-id-voxlingua107-ecapa` (base) | 21,2 M | 107 | hasta 30 s | Apache-2.0 | safetensors/PyTorch | Requiere SpeechBrain y PyTorch |
| Whisper (deteccion de idioma integrada) | 39 M – 1.550 M | ~99 | 30 s | MIT | varios | La deteccion de idioma es un subproducto del ASR, no un clasificador dedicado |
| VoxLingua107 x-vector (versiones anteriores) | ~5 M | 107 | variable | Apache-2.0 | PyTorch | Menor precision que ECAPA-TDNN segun el paper original |

La comparativa con Whisper no es estrictamente equivalente: Whisper realiza deteccion de idioma como tarea auxiliar del decoder, mientras que este modelo es un clasificador dedicado con mayor control sobre el conjunto de candidatos. No se dispone de datos de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de transcripcion**: devuelve etiquetas de idioma, no texto. Confundirlo con un ASR es el error de uso más habitual.
- **Riesgo de confusion entre lenguas cercanas**: idiomas con alta similitud lexica y fonetica (por ejemplo, danes/noruego/sueco, checo/eslovaco, hindi/urdu) pueden confundirse, especialmente con clips cortos o ruidosos.
- **Desequilibrio del corpus**: VoxLingua107 tiene cobertura desigual entre lenguas, lo que puede traducirse en menor precision para idiomas con pocas horas de entrenamiento.
- **Dependencia del audio de entrada**: requiere 16 kHz mono; audio con ruido, musica de fondo o hablantes no nativos puede degradar la precision.
- **Ventana de 30 s**: solo puntua hasta los últimos 30 segundos del clip; audios más largos se truncan.
- **Sin streaming**: no soporta procesamiento incremental (`streaming: false`), por lo que no es adecuado para deteccion en tiempo real continua sin trocear el audio.
- **Sin timestamps ni traduccion**: no proporciona marcas temporales ni traduccion (`timestamps: none`, `translate: false`).
- **Sesgos**: no se documentan sesgos especificos en la informacion disponible; al derivar de un corpus de YouTube, puede heredar sesgos de representacion por region, genero y variedad dialectal.
- **Licencia**: Apache-2.0, permisiva para uso comercial, pero conviene revisar la model card original de SpeechBrain para terminos adicionales del dataset VoxLingua107.
- **Madurez del ecosistema**: `transcribe.cpp` es un runtime joven; la validacion numerica contra SpeechBrain esta documentada, pero el soporte de la comunidad es limitado (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/lang-id-voxlingua107-ecapa-gguf
- Modelo base en Hugging Face: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/lang-id-voxlingua107-ecapa.md
- Documentacion de la API LANGID: `docs/langid.md` en el repositorio de transcribe.cpp
- Paper VoxLingua107 (arXiv): https://arxiv.org/abs/2106.04624
- Dataset VoxLingua107: https://cs.taltech.ee/staff/tanel.alumae/data/voxlingua107/
- Commit del modelo base referenciado: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa/commit/0253049
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/aa4d0f47
